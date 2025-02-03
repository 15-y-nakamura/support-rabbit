<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserToken;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    /**
     * ログインフォームの表示
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        if (Auth::check()) {
            return redirect()->route('home'); // ログイン済みなら /home にリダイレクト
        }
        return Inertia::render('Auth/LoginForm');
    }
    
    /**
     * ログイン処理
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('login_id', 'password');

        // 認証試行
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            // ユーザーのトークンを管理する処理を追加
            $user = Auth::user();
            $this->deleteExistingToken($user);
            $token = $this->createUserToken($user);

            Log::info('User logged in successfully', ['user_id' => $user->id, 'token' => $token->token]);

            return response()->json(['token' => $token->token, 'user' => $user], 200);
        }

        // 認証失敗時
        return response()->json(['error' => 'ユーザIDまたはパスワードが違います'], 401);
    }

    /**
     * APIログイン処理
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiLogin(LoginRequest $request)
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