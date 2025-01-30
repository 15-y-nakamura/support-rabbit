<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;

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
     * @return \Illuminate\Http\RedirectResponse
     */
    public function login(LoginRequest $request)
    {
        // 認証試行
        if (Auth::attempt($request->only('login_id', 'password'), $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('home'));
        }

        // 認証失敗時
        return back()->withErrors([
            'login' => 'ユーザIDまたはパスワードが違います',
        ])->onlyInput('login_id');
    }

    /**
     * ログアウト処理
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('status', 'ログアウトしました。');
    }
}
