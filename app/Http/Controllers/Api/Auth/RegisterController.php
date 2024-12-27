<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class RegisterController extends Controller
{
    /**
     * 登録画面を表示します。
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * 登録リクエストを処理します。
     */
    public function store(Request $request)
    {
        $request->validate([
            'nickname' => 'required|string|max:15',
            'login_id' => 'required|string|max:15|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'birthday' => ['nullable', 'date'],
        ]);

        $user = User::create([
            'nickname' => $request->nickname,
            'login_id' => $request->login_id,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday' => $request->birthday,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return Inertia::render('Auth/RegisterSuccess', [
            'message' => 'User registered successfully',
            'user' => $user
        ]);
    }

    /**
     * API登録リクエストを処理します。
     */
    public function signup(Request $request)
    {
        try {
            // 新しいユーザーを作成
            $user = $this->createUser($request);

            // ユーザートークンを作成
            $token = $this->createUserToken($user);

            // 登録イベントを発生させる
            event(new Registered($user));

            return response()->json(['token' => $token->token]);
        } catch (Exception $e) {
            return response()->json(['error' => '登録中にエラーが発生しました'], 500);
        }
    }

    /**
     * 新しいユーザーを作成します。
     */
    private function createUser(Request $request): User
    {
        $request->validate([
            'userId' => 'required|string|max:15|unique:users,login_id',
            'nickname' => 'required|string|max:15',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'birthday' => ['nullable', 'date'],
        ]);

        $user = User::create([
            'login_id' => $request->userId,
            'nickname' => $request->nickname,
            'password' => Hash::make($request->password),
            'email' => $request->email,
            'birthday' => $request->birthday,
        ]);

        return $user;
    }

    /**
     * ユーザートークンを作成します。
     */
    private function createUserToken(User $user): UserToken
    {
        $token = new UserToken();
        $token->createToken($user);
        return $token;
    }
}
