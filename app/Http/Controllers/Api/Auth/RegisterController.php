<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest; // RegisterRequestをインポート
use App\Models\User;
use App\Models\UserToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
        return Inertia::render('Auth/RegisterForm');
    }

    /**
     * 登録リクエストを処理します。
     */
    public function store(RegisterRequest $request) // RegisterRequestを使用
    {
        $user = User::create([
            'login_id' => $request->login_id,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday' => $request->birthday,
        ]);

        event(new Registered($user));

        Auth::login($user);

        // 登録成功時に/homeにリダイレクト
        return redirect()->route('home');
    }

    /**
     * API登録リクエストを処理します。
     */
    public function signup(RegisterRequest $request) // RegisterRequestを使用
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
            Log::error('Signup failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => '登録中にエラーが発生しました'], 500);
        }
    }

    /**
     * 新しいユーザーを作成します。
     */
    private function createUser(RegisterRequest $request): User // RegisterRequestを使用
    {
        return User::create([
            'login_id' => $request->login_id,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday' => $request->birthday,
        ]);
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