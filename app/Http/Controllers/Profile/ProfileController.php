<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Profile\ProfileShowRequest;
use App\Http\Requests\Profile\ProfileUpdateRequest;
use App\Http\Requests\Profile\PasswordUpdateRequest;
use App\Http\Requests\Profile\DeleteProfileRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * プロフィール編集画面を表示します。
     */
    public function edit()
    {
        return Inertia::render('Profile/Edit', [
            'user' => Auth::user()
        ]);
    }

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
     * ユーザープロフィールを更新します。
     */
    public function update(ProfileUpdateRequest $request)
    {
        try {
            $user = $request->user();

            $user->updateProfile($request->nickname, $request->email, $request->birthday, $request->login_id);

            if ($request->is('api/*')) {
                return response()->json(['message' => 'プロフィールが更新されました'], 200);
            }

            return redirect()->route('profile.edit')->with('status', 'プロフィールが更新されました');
        } catch (\Exception $e) {
            if ($request->is('api/*')) {
                return response()->json(['error' => 'プロフィールの更新中にエラーが発生しました'], 500);
            }

            return redirect()->route('profile.edit')->with('error', 'プロフィールの更新中にエラーが発生しました');
        }
    }

    /**
     * ユーザーパスワードを更新します。
     */
    public function password(PasswordUpdateRequest $request)
    {
        try {
            $user = $request->user();
            $user->updatePassword($request->password);

            if ($request->is('api/*')) {
                return response()->json(['message' => 'パスワードが更新されました'], 200);
            }

            return redirect()->route('profile.edit')->with('status', 'パスワードが更新されました');
        } catch (\Exception $e) {
            if ($request->is('api/*')) {
                return response()->json(['error' => 'パスワードの更新中にエラーが発生しました'], 500);
            }

            return redirect()->route('profile.edit')->with('error', 'パスワードの更新中にエラーが発生しました');
        }
    }

    /**
     * ユーザーアカウントを削除します。
     */
    public function destroy(DeleteProfileRequest $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->is('api/*')) {
            return response()->json(['message' => 'アカウントが削除されました'], 200);
        }

        return redirect()->route('login')->with('status', 'アカウントが削除されました');
    }
}