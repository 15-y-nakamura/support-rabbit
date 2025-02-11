<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
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
     * 登録画面を表示
     */
    public function create()
    {
        return Inertia::render('Auth/RegisterForm');
    }

    /**
     * Webの登録処理
     */
    public function store(RegisterRequest $request)
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

        Log::info('ユーザー登録が正常に完了しました', ['user_id' => $user->id]);

        return Inertia::render('Auth/RegisterForm', [
            'registrationSuccess' => true,
        ]);
    }

    /**
     * APIの登録処理
     */
    public function signup(RegisterRequest $request)
    {
        try {
            $user = $this->createUser($request);

            // 登録イベントを発生させる
            event(new Registered($user));

            return response()->json(['message' => '登録が完了しました', 'user' => $user], 201);
        } catch (Exception $e) {
            return response()->json(['error' => '登録中にエラーが発生しました'], 500);
        }
    }

    /**
     * 新しいユーザーを作成
     */
    private function createUser(RegisterRequest $request): User
    {
        return User::create([
            'login_id' => $request->login_id,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthday' => $request->birthday,
        ]);
    }
}