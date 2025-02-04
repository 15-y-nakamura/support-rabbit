<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\WeekdayEventRequest;
use App\Models\WeekdayEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;
use App\Models\UserToken;
use Illuminate\Support\Facades\Log;

class WeekdayEventsController extends Controller
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
        $events = WeekdayEvent::with('tag')
            ->where('user_id', $userToken->user_id) // 認証している user_id と一致するデータを取得
            ->where('title', 'like', '%' . $query . '%')
            ->get();

        Log::info('Fetched Weekday Events:', ['events' => $events]);

        return response()->json(['events' => $events]);
    }

    public function show($id)
    {
        try {
            $event = WeekdayEvent::with('tag')->find($id);
            if (!$event) return response()->json(['error' => 'イベントが見つかりません'], 404);

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(WeekdayEventRequest $request)
    {
        try {
            // トークンを使用してユーザーを認証
            $token = $request->bearerToken();
            Log::info('Received Token:', ['token' => $token]);
            $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();
    
            if (!$userToken) {
                throw new \Exception('User not authenticated');
            }
    
            $validatedData = $request->validated();
            Log::info('Validated Data:', $validatedData);
    
            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);
    
            $period = CarbonPeriod::create($startDate, $endDate);
    
            foreach ($period as $date) {
                if ($date->isWeekday()) {
                    WeekdayEvent::create([
                        'event_id' => $validatedData['event_id'],
                        'user_id' => $userToken->user_id, // user_idを保存
                        'title' => $validatedData['title'],
                        'start_time' => $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['start_time']))->format('H:i'),
                        'end_time' => $validatedData['end_time'] ? $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['end_time']))->format('H:i') : null,
                        'all_day' => $validatedData['all_day'],
                        'notification' => $validatedData['notification'],
                        'location' => $validatedData['location'],
                        'link' => $validatedData['link'],
                        'tag_id' => $validatedData['tag_id'], // タグの保存
                        'description' => $validatedData['description'],
                        'recurrence_type' => $validatedData['recurrence_type'], // 繰り返しの種類の保存
                    ]);
                }
            }
    
            return response()->json(['message' => 'Weekday events created successfully'], 201);
        } catch (\Exception $e) {
            Log::error('Error creating weekday events: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(WeekdayEventRequest $request, $id)
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
    
            $event = WeekdayEvent::find($id);
            if (!$event) return response()->json(['error' => 'イベントが見つかりません'], 404);
    
            Log::info('Updating weekday event with ID:', ['id' => $id]); // 追加
    
            $event->update([
                'title' => $validatedData['title'],
                'start_time' => $validatedData['start_time'],
                'end_time' => $validatedData['end_time'],
                'all_day' => $validatedData['all_day'],
                'notification' => $validatedData['notification'],
                'location' => $validatedData['location'],
                'link' => $validatedData['link'],
                'tag_id' => $validatedData['tag_id'],
                'description' => $validatedData['description'],
                'recurrence_type' => $validatedData['recurrence_type'],
            ]);
    
            return response()->json(['message' => 'Weekday event updated successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error updating weekday event: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $req, $id)
    {
        try {
            $event = WeekdayEvent::find($id);
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
            WeekdayEvent::where('event_id', $eventId)->delete();

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}