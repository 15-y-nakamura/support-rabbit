<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Lib\APIResponse;

class LogoutController extends Controller
{
    /**
     * ユーザーログアウトを処理します。
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user && $user->user_token) {
            $user->user_token->delete();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return APIResponse::success();
    }
}
