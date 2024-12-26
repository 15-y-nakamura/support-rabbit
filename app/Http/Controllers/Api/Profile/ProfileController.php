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
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * ユーザープロフィールを表示します。
     */
    public function show(ProfileShowRequest $request)
    {
        $authUser = Auth::user();

        if (!$authUser) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // $authUserをApp\Models\User型にキャスト
        $user = User::find($authUser->id);

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

            return redirect()->route('profile.edit')->with('status', 'Profile updated successfully'); // Inertiaレスポンスを返す
        } catch (\Exception $e) {
            return redirect()->route('profile.edit')->with('error', 'There was an error updating the profile'); // エラーレスポンスを返す
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

            return APIResponse::success();
        } catch (\Exception $e) {
            return APIResponse::generalError();
        }
    }

    /**
     * ユーザーアカウントを削除します。
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

    /**
     * プロフィール編集画面を表示します。
     */
    public function edit()
    {
        return Inertia::render('Profile/Edit', [
            'user' => Auth::user()
        ]);
    }
}
