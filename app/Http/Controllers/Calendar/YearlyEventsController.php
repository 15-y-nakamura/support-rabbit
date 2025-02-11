<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\YearlyEventRequest;
use App\Models\YearlyEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;
use App\Models\UserToken;
use Illuminate\Support\Facades\Log;

class YearlyEventsController extends Controller
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
            Log::warning('【カレンダーイベント(毎年)】認証失敗: トークンが無効または期限切れ');
            throw new \Exception('ユーザーが認証されていません');
        }

        return $userToken;
    }

    /**
     * ユーザーのカレンダーイベント(毎年)を取得
     */
    public function index(Request $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $query = $request->input('query');
            $events = YearlyEvent::with('tag')
                ->where('user_id', $userToken->user_id)
                ->where('title', 'like', '%' . $query . '%')
                ->get();

            return response()->json(['events' => $events]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * 指定したカレンダーイベント(毎年)を取得
     */
    public function show($id)
    {
        try {
            $event = YearlyEvent::with('tag')->find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎年)】取得失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * 新しいカレンダーイベント(毎年)を作成
     */
    public function store(YearlyEventRequest $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $validatedData = $request->validated();

            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);
            $recurrenceDate = $validatedData['recurrence_date'] ?? $startDate->format('m/d'); // 選択された日付

            // 開始日から終了日までの毎年の期間を生成
            $period = CarbonPeriod::create($startDate, '1 year', $endDate);

            foreach ($period as $date) {
                // 繰り返し日を設定
                $eventDate = \DateTime::createFromFormat('m/d', $recurrenceDate);
                $eventDate->setDate($date->format('Y'), $eventDate->format('m'), $eventDate->format('d'));

                // イベント日が開始日と終了日の間にある場合にイベントを作成
                if ($eventDate >= $startDate && $eventDate <= $endDate) {
                    YearlyEvent::create(array_merge($validatedData, [
                        'user_id' => $userToken->user_id,                       
                    ]));
                }
            }

            return response()->json(['message' => 'イベントが作成されました'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの作成に失敗しました'], 500);
        }
    }

    /**
     * カレンダーイベント(毎年)を更新
     */
    public function update(YearlyEventRequest $request, $id)
    {
        try {
            $event = YearlyEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎年)】更新失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            $validatedData = $request->validated();
            $event->update($validatedData);

            return response()->json(['message' => 'Yearly event updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの更新に失敗しました'], 500);
        }
    }

    /**
     * カレンダーイベント(毎年)を削除
     */
    public function destroy(Request $req, $id)
    {
        try {
            $event = YearlyEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎年)】削除失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            $event->delete();

            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの削除に失敗しました'], 500);
        }
    }

    /**
     * 繰り返しイベントを含むすべての関連イベントを削除
     */
    public function destroyAll($eventId)
    {
        try {
            YearlyEvent::where('event_id', $eventId)->delete();

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
