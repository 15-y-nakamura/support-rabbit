<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Profile\ProfileShowRequest;
use App\Http\Requests\Profile\ProfileUpdateRequest;
use App\Http\Requests\Profile\PasswordUpdateRequest;
use App\Models\User;
use App\Lib\APIResponse;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * ユーザープロフィールを取得（API用）
     */
    public function show(ProfileShowRequest $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'user' => $user->user_info()
        ]);
    }

    /**
     * ユーザープロフィールを更新（API用）
     */
    public function update(ProfileUpdateRequest $request)
    {
        try {
            $user = $request->user();

            $user->updateProfile($request->nickname, $request->email, $request->birthday, $request->login_id);

            return response()->json(['message' => 'プロフィールが更新されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'プロフィールの更新中にエラーが発生しました'], 500);
        }
    }

    /**
     * ユーザーパスワードを更新（API用）
     */
    public function password(PasswordUpdateRequest $request)
    {
        try {
            $user = $request->user();
            $user->updatePassword($request->password);

            return APIResponse::success();
        } catch (\Exception $e) {
            return APIResponse::generalError();
        }
    }

    /**
     * ユーザーアカウントを削除（API用）
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return APIResponse::success();
    }
}
