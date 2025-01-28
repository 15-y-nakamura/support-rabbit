<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\UserToken;

class LoginController extends Controller
{
    /**
     * ログインページを表示します。
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Auth/LoginForm');
    }

    /**
     * ユーザーのログインを処理します。
     *
     * @param  \App\Http\Requests\Auth\LoginRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function login(LoginRequest $request)
    {
        // ログイン資格情報の取得
        $credentials = $request->only('login_id', 'password');

        // 認証処理
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // トークンの管理
            $user = Auth::user();
            $this->manageUserToken($user);

            // ログイン後のリダイレクト
            return redirect()->intended(route('home'));
        }

        // 認証失敗時の処理（適宜エラーメッセージの表示処理を実装）
        return back()->withErrors([
            'login' => 'ユーザIDまたはパスワードが違います',
        ])->onlyInput('login_id');
    }

    /**
     * ユーザートークンの管理を行います。
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    private function manageUserToken(User $user): void
    {
        $this->deleteExistingToken($user);
        $this->createUserToken($user);
    }

    /**
     * 既存のユーザートークンを削除します。
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
     * 新しいユーザートークンを作成します。
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
