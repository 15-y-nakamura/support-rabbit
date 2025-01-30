<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\UserToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;

class RegisterController extends Controller
{
    /**
     * APIの登録処理
     */
    public function signup(RegisterRequest $request)
    {
        try {
            // 新しいユーザーを作成
            $user = $this->createUser($request);

            // ユーザートークンを作成
            $token = $this->createUserToken($user);

            // 登録イベントを発生させる
            event(new Registered($user));

            return response()->json(['token' => $token->token, 'user' => $user], 201);
        } catch (Exception $e) {
            Log::error('Signup failed', ['error' => $e->getMessage()]);
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

    /**
     * ユーザートークンを作成
     */
    private function createUserToken(User $user): UserToken
    {
        $token = new UserToken();
        $token->createToken($user);
        return $token;
    }
}
