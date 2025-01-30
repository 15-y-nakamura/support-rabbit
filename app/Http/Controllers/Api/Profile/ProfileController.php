<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Profile\ProfileShowRequest;
use App\Http\Requests\Profile\ProfileUpdateRequest;
use App\Http\Requests\Profile\PasswordUpdateRequest;
use App\Http\Requests\Profile\DeleteProfileRequest;
use App\Models\User;
use App\Lib\APIResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
    public function destroy(DeleteProfileRequest $request)
    {
        // 🔹 バリデーションを実行（失敗時は自動的にレスポンスを返す）
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // 🔹 バリデーションに失敗したら処理を中断
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'errors' => ['password' => 'パスワードが正しくありません']
            ], 422);
        }

        // 🔹 ログアウトしてユーザーを削除
        Auth::logout();
        $user->delete();

        // 🔹 セッションを無効化
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'アカウントが削除されました'], 200);
    }
}
