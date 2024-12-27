<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class EmailVerificationController extends Controller
{
    /**
     * メールアドレスの確認を処理します。
     */
    public function verifyEmail(EmailVerificationRequest $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'メールは既に認証されています']);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return response()->json(['message' => 'メールが認証されました']);
    }

    /**
     * メールアドレス確認通知を再送信します。
     */
    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'メールは既に認証されています']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => '認証リンクが送信されました']);
    }
}
