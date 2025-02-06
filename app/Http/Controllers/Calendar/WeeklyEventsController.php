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
    public function index(Request $request)
    {
        // トークンを使用してユーザーを認証
        $token = $request->bearerToken();
        Log::info('Received Token:', ['token' => $token]);
        $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();

        if (!$userToken) {
            throw new \Exception('User not authenticated');
        }

        Log::info('Authenticated User ID:', ['user_id' => $userToken->user_id]);

        $query = $request->input('query');
        $events = WeeklyEvent::with('tag')
            ->where('user_id', $userToken->user_id) // 認証している user_id と一致するデータを取得
            ->where('title', 'like', '%' . $query . '%')
            ->get();

        return response()->json(['events' => $events]);
    }

    public function show($id)
    {
        try {
            $event = WeeklyEvent::with('tag')->find($id);
            if (!$event) return response()->json(['error' => 'イベントが見つかりません'], 404);

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(WeeklyEventRequest $request)
    {
        try {
            // トークンを使用してユーザーを認証
            $token = $request->bearerToken();
            Log::info('受信したトークン:', ['token' => $token]);
            $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();
    
            if (!$userToken) {
                throw new \Exception('ユーザーが認証されていません');
            }
    
            $validatedData = $request->validated();
            Log::info('検証済みデータ:', $validatedData);
    
            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);
            $daysOfWeek = $request->input('recurrence_days', []);
            Log::info('曜日:', $daysOfWeek);
    
            $period = CarbonPeriod::create($startDate, $endDate);
    
            foreach ($period as $date) {
                if (in_array($date->dayOfWeek, $daysOfWeek)) {
                    $eventData = [
                        'event_id' => $validatedData['event_id'],
                        'user_id' => $userToken->user_id, // user_idを保存
                        'title' => $validatedData['title'],
                        'start_time' => $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['start_time']))->format('H:i'),
                        'end_time' => $validatedData['end_time'] ? $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['end_time']))->format('H:i') : null,
                        'all_day' => $validatedData['all_day'],
                        'location' => $validatedData['location'],
                        'link' => $validatedData['link'],
                        'tag_id' => $validatedData['tag_id'], // タグの保存
                        'note' => $validatedData['note'],
                        'recurrence_type' => $validatedData['recurrence_type'], // 繰り返しの種類の保存
                    ];
                    Log::info('作成する週次イベント:', $eventData);
                    $createdEvent = WeeklyEvent::create($eventData);
                    Log::info('作成された週次イベント:', ['event' => $createdEvent]);
                }
            }
    
            return response()->json(['message' => '週次イベントが正常に作成されました'], 201);
        } catch (\Exception $e) {
            Log::error('週次イベントの作成中にエラーが発生しました: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(WeeklyEventRequest $request, $id)
    {
        try {
            // トークンを使用してユーザーを認証
            $token = $request->bearerToken();
            Log::info('受信したトークン:', ['token' => $token]);
            $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();
    
            if (!$userToken) {
                throw new \Exception('ユーザーが認証されていません');
            }
    
            $validatedData = $request->validated();
            Log::info('検証済みデータ:', $validatedData);
    
            $event = WeeklyEvent::find($id);
            if (!$event) return response()->json(['error' => 'イベントが見つかりません'], 404);
    
            $event->update([
                'title' => $validatedData['title'],
                'start_time' => $validatedData['start_time'],
                'end_time' => $validatedData['end_time'],
                'all_day' => $validatedData['all_day'],
                'location' => $validatedData['location'],
                'link' => $validatedData['link'],
                'tag_id' => $validatedData['tag_id'],
                'note' => $validatedData['note'],
                'recurrence_type' => $validatedData['recurrence_type'],
            ]);
    
            return response()->json(['message' => '週次イベントが正常に更新されました'], 200);
        } catch (\Exception $e) {
            Log::error('週次イベントの更新中にエラーが発生しました: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $req, $id)
    {
        try {
            $event = WeeklyEvent::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            $event->delete();

            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroyAll($eventId)
    {
        try {
            // 繰り返しイベントを含むすべての関連イベントを削除
            WeeklyEvent::where('event_id', $eventId)->delete();

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}