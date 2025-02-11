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
     */
    public function create()
    {
        return Inertia::render('Auth/LoginForm');
    }
    
    /**
     * ログイン処理
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('login_id', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            // 現在のユーザーのトークンを管理（既存のトークンを削除し、新しいトークンを作成）
            $user = Auth::user();
            $this->deleteExistingToken($user); // 既存のトークンを削除
            $token = $this->createUserToken($user); // 新しいトークンを作成


            // アプリ起動時に最初に表示されるカレンダー画面へ
            // ユーザー情報と認証トークンを渡して表示する
            return Inertia::render('Calendar/Calendar', [
                'token' => $token->token,
                'user' => $user,
            ]);
        }

        return back()->withErrors(['login' => 'ユーザIDまたはパスワードが違います'])->withInput();
    }

    /**
     * APIログイン処理
     */
    public function apiLogin(LoginRequest $request)
    {
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
     */
    private function deleteExistingToken(User $user): void
    {
        if ($user->user_token) {
            $user->user_token->delete();
        }
    }

    /**
     * 新しいユーザートークンを作成
     */
    private function createUserToken(User $user): UserToken
    {
        $token = new UserToken();
        $token->createToken($user);
        return $token;
    }
}