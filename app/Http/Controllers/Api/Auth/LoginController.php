<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserToken;

class LoginController extends Controller
{
    /**
     * APIログイン処理
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        // ユーザー取得
        $user = User::where('login_id', $request->login_id)->first();

        if (!$user || !Auth::attempt($request->only('login_id', 'password'))) {
            return response()->json([
                'message' => 'ユーザIDまたはパスワードが違います',
                'code' => 'invalid_credentials'
            ], 401);
        }

        // 既存のトークン削除
        $this->deleteExistingToken($user);

        // 新しいトークンを作成
        $token = $this->createUserToken($user);

        return response()->json([
            'message' => 'ログイン成功',
            'token' => $token->token,
            'user' => $user
        ], 200);
    }

    /**
     * APIログアウト処理
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user && $user->user_token) {
            $user->user_token->delete();
        }

        Auth::guard('sanctum')->logout();
        return response()->json(['message' => 'ログアウトしました。'], 200);
    }

    /**
     * 既存のユーザートークンを削除
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    private function deleteExistingToken(User $user): void
    {
        if ($user->user_token) {
            $user->user_token->delete();
        }
    }

    /**
     * 新しいユーザートークンを作成
     *
     * @param  \App\Models\User  $user
     * @return \App\Models\UserToken
     */
    private function createUserToken(User $user): UserToken
    {
        $token = new UserToken();
        $token->createToken($user);
        return $token;
    }
}
