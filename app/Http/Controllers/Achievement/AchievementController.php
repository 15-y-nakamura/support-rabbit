<?php

namespace App\Http\Controllers\Achievement;

use App\Http\Requests\Achievement\AchievementRequest;
use Illuminate\Http\Request;
use App\Models\Achievement;
use App\Models\UserToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controller;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AchievementController extends Controller
{
    public function index(Request $request)
    {
        try {
            // トークンを使用してユーザーを認証
            $token = $request->bearerToken();
            Log::info('受信したトークン:', ['token' => $token]);
            $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();

            if (!$userToken) {
                throw new \Exception('ユーザーが認証されていません');
            }

            Log::info('認証されたユーザーID:', ['user_id' => $userToken->user_id]);

            // 認証されたユーザーのアチーブメントを取得
            $achievements = Achievement::where('user_id', $userToken->user_id)->get();

            Log::info('取得されたアチーブメント:', ['achievements' => $achievements]);

            return response()->json(['achievements' => $achievements], 200);
        } catch (\Exception $e) {
            Log::error('アチーブメント取得エラー: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(AchievementRequest $req)
    {
        try {
            // トークンを使用してユーザーを認証
            $token = $req->bearerToken();
            Log::info('受信したトークン:', ['token' => $token]);
            $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();

            if (!$userToken) {
                throw new \Exception('ユーザーが認証されていません');
            }

            Log::info('認証されたユーザーID:', ['user_id' => $userToken->user_id]);

            $validated = $req->validated();
            Log::info('バリデーション済みデータ:', $validated);

            // achieved_at を現在の日時に設定
            $validated['achieved_at'] = Carbon::now()->format('Y-m-d H:i:s');

            // achievementsテーブルにデータを保存
            $achievement = Achievement::create([
                'user_id' => $userToken->user_id,
                'title' => $validated['title'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'achieved_at' => $validated['achieved_at'],
            ]);

            Log::info('作成されたアチーブメント:', ['achievement' => $achievement]);

            return response()->json(['message' => 'イベントが達成されました', 'achievement' => $achievement], 201);
        } catch (ValidationException $e) {
            Log::error('バリデーションエラー: ' . $e->getMessage(), ['errors' => $e->errors()]);
            return response()->json(['error' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('イベント達成エラー: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}