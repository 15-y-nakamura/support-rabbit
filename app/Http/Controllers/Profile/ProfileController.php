<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
     * ユーザープロフィールを更新します。
     */
    public function update(ProfileUpdateRequest $request)
    {
        try {
            $user = $request->user();

            $user->updateProfile($request->nickname, $request->email, $request->birthday, $request->login_id);

            return redirect()->route('profile.edit')->with('status', 'プロフィールが更新されました');
        } catch (\Exception $e) {
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

            return redirect()->route('profile.edit')->with('status', 'パスワードが更新されました');
        } catch (\Exception $e) {
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

        return redirect()->route('login')->with('status', 'アカウントが削除されました');
    }
}
