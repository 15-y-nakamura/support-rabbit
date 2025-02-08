<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\MonthlyEventRequest;
use App\Models\MonthlyEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;
use App\Models\UserToken;
use Illuminate\Support\Facades\Log;

class MonthlyEventsController extends Controller
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
            Log::warning('【カレンダーイベント(毎月)】認証失敗: トークンが無効または期限切れ');
            throw new \Exception('ユーザーが認証されていません');
        }

        return $userToken;
    }

    /**
     * ユーザーのカレンダーイベント(毎月)を取得
     */
    public function index(Request $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $query = $request->input('query');
            $events = MonthlyEvent::with('tag')
                ->where('user_id', $userToken->user_id)
                ->where('title', 'like', '%' . $query . '%')
                ->get();

            return response()->json(['events' => $events]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * 指定したカレンダーイベント(毎月)を取得
     */
    public function show($id)
    {
        try {
            $event = MonthlyEvent::with('tag')->find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎月)】イベント取得失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * 新しいカレンダーイベント(毎月)を作成
     */
    public function store(MonthlyEventRequest $request)
    {
        try {
            $userToken = $this->authenticateUser($request);

            $validatedData = $request->validated();
            Log::info('【カレンダーイベント(毎月)】のバリデーション成功', ['user_id' => $userToken->user_id]);

            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);
            $recurrenceDay = $validatedData['recurrence_date'] ?? $startDate->format('d');

            $period = CarbonPeriod::create($startDate, '1 month', $endDate);

            foreach ($period as $date) {
                $eventDate = new \DateTime($date->format('Y') . '-' . $date->format('m') . '-' . $recurrenceDay);

                if ($eventDate >= $startDate && $eventDate <= $endDate) {
                    MonthlyEvent::create(array_merge($validatedData, [
                        'user_id' => $userToken->user_id,
                        'start_time' => $eventDate->format('Y-m-d') . 'T' . (new \DateTime($validatedData['start_time']))->format('H:i'),
                        'end_time' => $validatedData['end_time'] ? $eventDate->format('Y-m-d') . 'T' . (new \DateTime($validatedData['end_time']))->format('H:i') : null,
                        'recurrence_date' => $recurrenceDay,
                    ]));
                }
            }
    
            return response()->json(['message' => 'イベントが作成されました'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの作成に失敗しました'], 500);
        }
    }
    /**
     * カレンダーイベント(毎月)を更新
     */
    public function update(MonthlyEventRequest $request, $id)
    {
        try {
            $event = MonthlyEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎月)】更新失敗: イベントが見つかりません', ['event_id' => $id]);
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }

            $validatedData = $request->validated();
            $event->update($validatedData);

            return response()->json(['message' => 'Monthly event updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'イベントの更新に失敗しました'], 500);
        }
    }

    /**
     * カレンダーイベント(毎月)を削除
     */
    public function destroy(Request $req, $id)
    {
        try {
            $event = MonthlyEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント(毎月)】削除失敗: イベントが見つかりません', ['event_id' => $id]);
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
            MonthlyEvent::where('event_id', $eventId)->delete();

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}