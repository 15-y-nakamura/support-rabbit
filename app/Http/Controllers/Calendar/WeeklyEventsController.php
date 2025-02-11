<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\WeeklyEventRequest;
use App\Models\WeeklyEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;
use App\Models\UserToken;
use Illuminate\Support\Facades\Log;

class WeeklyEventsController extends Controller
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
            Log::warning('【カレンダーイベント(毎週)】認証失敗: トークンが無効または期限切れ');
            throw new \Exception('ユーザーが認証されていません');
        }

        return $userToken;
    }

    /**
     * ユーザーのカレンダーイベント(毎週)を取得
     */
    public function index(Request $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $query = $request->input('query');
            $events = WeeklyEvent::with('tag')
                ->where('user_id', $userToken->user_id)
                ->where('title', 'like', '%' . $query . '%')
                ->get();

            return response()->json(['events' => $events]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * 指定したカレンダーイベント(毎週)を取得
     */
    public function show($id)
    {
        try {
            $event = WeeklyEvent::with('tag')->find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎週)】取得失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * 新しいカレンダーイベント(毎週)を作成
     */
    public function store(WeeklyEventRequest $request)
    {
        try {
            $userToken = $this->authenticateUser($request);
   
            $validatedData = $request->validated();

            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);
            $daysOfWeek = $request->input('recurrence_days', []);
  
            $period = CarbonPeriod::create($startDate, $endDate);

            foreach ($period as $date) {
                if (in_array($date->dayOfWeek, $daysOfWeek)) {
                    $startDateTime = (clone $date)->setTime(
                        $startDate->format('H'),
                        $startDate->format('i'),
                        $startDate->format('s')
                    );
                    $endDateTime = (clone $date)->setTime(
                        $endDate->format('H'),
                        $endDate->format('i'),
                        $endDate->format('s')
                    );
    
                    WeeklyEvent::create(array_merge($validatedData, [
                        'user_id' => $userToken->user_id,
                        'start_time' => $startDateTime->format('Y-m-d H:i:s'),
                        'end_time' => $endDateTime->format('Y-m-d H:i:s'),
                        'recurrence_days' => json_encode($daysOfWeek), // 配列をJSON形式に変換
                    ]));
                }
            }
            return response()->json(['message' => 'イベントが作成されました'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの作成に失敗しました'], 500);
        }
    }

    /**
     * カレンダーイベント(毎週)を更新
     */
    public function update(WeeklyEventRequest $request, $id)
    {
        try {
            $event = WeeklyEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎週)】更新失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            $validatedData = $request->validated();
            $event->update($validatedData);

            return response()->json(['message' => 'イベントが更新されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの更新に失敗しました'], 500);
        }
    }

    /**
     * カレンダーイベント(毎週)を削除
     */
    public function destroy(Request $req, $id)
    {
        try {
            $event = WeeklyEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎週)】削除失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            $event->delete();

            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの削除に失敗しました'], 500);
        }
    }

    /**
     *  繰り返しイベントを含むすべての関連イベントを削除
     */
    public function destroyAll($eventId)
    {
        try {
            WeeklyEvent::where('event_id', $eventId)->delete();

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
