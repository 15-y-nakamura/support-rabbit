<?php

namespace App\Http\Controllers\Achievement;

use App\Http\Requests\Achievement\AchievementRequest;
use Illuminate\Http\Request;
use App\Models\Achievement;
use App\Models\UserToken;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AchievementController extends Controller
{
    /**
     * ユーザー認証処理（共通メソッド）
     */
    private function authenticateUser(Request $request): UserToken
    {
        $token = $request->bearerToken();

        $userToken = UserToken::where('token', $token)
                              ->where('expiration_time', '>', now())
                              ->first();

        if (!$userToken) {
            Log::warning('【達成数】認証失敗: トークンが無効または期限切れ');
            throw new \Exception('ユーザーが認証されていません');
        }

        return $userToken;
    }

    /**
     * ユーザーのアチーブメントを取得
     */
    public function index(Request $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $achievements = Achievement::where('user_id', $userToken->user_id)->get();

            return response()->json(['achievements' => $achievements], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => '達成データの取得に失敗しました'], 500);
        }
    }

    /**
     * ユーザーのアチーブメントを保存
     */
    public function store(AchievementRequest $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $validated = $request->validated();

            //データベースのフォーマットに合わせて日時を変換
            $validated['achieved_at'] = Carbon::now()->format('Y-m-d H:i:s');

            $achievement = Achievement::create([
                'user_id' => $userToken->user_id,
                'title' => $validated['title'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'achieved_at' => $validated['achieved_at'],
            ]);

            return response()->json(['message' => 'イベントが達成されました', 'achievement' => $achievement], 201);
        } catch (ValidationException $e) {
            return response()->json(['error' => '入力データに誤りがあります'], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの達成に失敗しました'], 500);
        }
    }
}
