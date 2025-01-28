<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Notifications\CustomResetPasswordNotification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\PasswordReset;

class PasswordResetController extends Controller
{
    /**
     * パスワードリセットリンクの送信を処理します。
     */
    public function sendPasswordResetLink(ForgotPasswordRequest $request)
    {
        $email = $request->input('email');
        $token = Str::random(60);

        Log::info('Generated token for password reset', ['token' => $token]);

        // カスタム通知を使用してパスワードリセットリンクを送信
        $user = User::where('email', $email)->first();
        if ($user) {
            $user->notify(new CustomResetPasswordNotification($token));
            Log::info('Password reset email sent', ['email' => $email]);

            // トークンをデータベースに保存
            DB::table('password_resets')->insert([
                'email' => $email,
                'token' => $token, // トークンをハッシュ化して保存
                'created_at' => Carbon::now(),
            ]);

            Log::info('Token saved to database', ['email' => $email, 'token' => $token]);
        } else {
            Log::error('User not found for email', ['email' => $email]);
        }

        return back()->with('status', __('passwords.sent'));
    }

    /**
     * パスワードリセットを処理します。
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        Log::info('Reset password request received', [
            'token' => $request->token,
            'password' => $request->password,
            'password_confirmation' => $request->password_confirmation,
        ]);

        // トークンからメールアドレスを取得
        $passwordReset = DB::table('password_resets')->where('token', $request->token)->first();

        if (!$passwordReset) {
            Log::error('Invalid token provided for password reset', ['token' => $request->token]);
            return back()->withErrors(['token' => '無効なトークンです']);
        }

        $user = User::where('email', $passwordReset->email)->first();

        if (!$user) {
            Log::error('User not found for email', ['email' => $passwordReset->email]);
            return back()->withErrors(['email' => __('passwords.user')]);
        }

        if (Hash::check($request->password, $user->password)) {
            Log::warning('New password is the same as the current password', ['user' => $user->email]);
            return back()->withErrors(['password' => '新しいパスワードは現在のパスワードと異なる必要があります']);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));

        Log::info('Password has been reset successfully', ['email' => $user->email]);

        return back()->with('status', __('passwords.reset'));
    }
}