<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $request->user()->only('login_id', 'nickname', 'email', 'birthday'), // 必要なフィールドを取得
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // $request->user()->fill($request->validated());

        // if ($request->user()->isDirty('email')) {
        //     $request->user()->email_verified_at = null;
        // }

        // $request->user()->save();

        // return Redirect::route('profile.edit');

        $user = $request->user();

        // フォームのバリデーション済みデータを反映
        $user->fill($request->validated());

        // メールアドレスが変更された場合、認証状態をリセット
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // ユーザー情報の保存
        $user->save();

        // 成功メッセージをセッションに追加
        return Redirect::route('profile.edit')->with('status', 'プロフィールが更新されました。');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // return Redirect::to('/');
        return Redirect::to('/')->with('status', 'アカウントが削除されました。');
    }
}
