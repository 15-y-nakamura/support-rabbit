<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\UserToken;

class LoginController extends Controller
{
    /**
     * Display the login view.
     */
    public function create()
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * ユーザーログインを処理します。
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('login_id', 'password');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // ユーザーのトークンを管理する処理を追加
            $user = Auth::user();
            $this->deleteExistingToken($user);
            $token = $this->createUserToken($user);

            return redirect()->intended(route('home'));
        }

        return back()->withErrors([
            'login_id' => '提供された認証情報は記録と一致しません。',
        ]);
    }

    /**
     * 既存のユーザートークンを削除します。
     */
    private function deleteExistingToken(User $user): void
    {
        if ($user->user_token) {
            $user->user_token->delete();
        }
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
