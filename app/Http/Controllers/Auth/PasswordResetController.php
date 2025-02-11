<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Inertia\Inertia;
use App\Notifications\CustomResetPasswordNotification;

class PasswordResetController extends Controller
{
    /**
     * パスワードリセットリンクの送信
     */
    public function sendPasswordResetLink(ForgotPasswordRequest $request)
    {
        $email = $request->input('email');
        $token = Str::random(60);

        // 既存のトークンを削除し、新しいトークンを保存
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => $token,
            'created_at' => Carbon::now(),
        ]);

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['email' => '該当するユーザーが見つかりません。']);
        }
        
        // カスタムメッセージのメールを送信
        $user->notify(new CustomResetPasswordNotification($token));

        return back()->with('status', __('passwords.sent'));
    }

    /**
     * パスワードリセットフォームの表示
     */
    public function showResetPasswordForm($token)
    {
        return Inertia::render('Auth/ResetPasswordForm', ['token' => $token]);
    }

    /**
     * パスワードリセット処理
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $passwordReset = DB::table('password_reset_tokens')->where('token', $request->token)->first();
    
        if (!$passwordReset) {
            return back()->withErrors(['token' => '無効なトークンです']);
        }    

        if (Carbon::parse($passwordReset->created_at)->addMinutes(60)->isPast()) {
            return back()->withErrors(['token' => 'このトークンは有効期限が切れています']);
        }

        $user = User::where('email', $passwordReset->email)->first();
        if (!$user) {
            return back()->withErrors(['email' => __('passwords.user')]);
        }

        if (Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => '新しいパスワードは現在のパスワードと異なる必要があります']);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        DB::table('password_reset_tokens')->where('token', $request->token)->delete();
    
        event(new PasswordReset($user));

        return back()->with('status', __('passwords.reset'));
    }
}
