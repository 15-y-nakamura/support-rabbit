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
        $events = MonthlyEvent::with('tag')
            ->where('user_id', $userToken->user_id) // 認証している user_id と一致するデータを取得
            ->where('title', 'like', '%' . $query . '%')
            ->get();

        return response()->json(['events' => $events]);
    }

    public function show($id)
    {
        try {
            $event = MonthlyEvent::with('tag')->find($id);
            if (!$event) return response()->json(['error' => 'イベントが見つかりません'], 404);

            return response()->json($event);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(MonthlyEventRequest $request)
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
            $recurrenceDay = $validatedData['recurrence_date'] ?? $startDate->format('d'); // 選択された日付
    
            $period = CarbonPeriod::create($startDate, '1 month', $endDate);
    
            foreach ($period as $date) {
                // 入力された日付を使用
                $eventDate = new \DateTime($date->format('Y') . '-' . $date->format('m') . '-' . $recurrenceDay);
                
                if ($eventDate >= $startDate && $eventDate <= $endDate) {
                    Log::info('Creating Monthly Event:', ['date' => $eventDate->format('Y-m-d')]);
                    MonthlyEvent::create([
                        'event_id' => $validatedData['event_id'],
                        'user_id' => $userToken->user_id, // user_idを保存
                        'title' => $validatedData['title'],
                        'start_time' => $eventDate->format('Y-m-d') . 'T' . (new \DateTime($validatedData['start_time']))->format('H:i'),
                        'end_time' => $validatedData['end_time'] ? $eventDate->format('Y-m-d') . 'T' . (new \DateTime($validatedData['end_time']))->format('H:i') : null,
                        'all_day' => $validatedData['all_day'],
                        'notification' => $validatedData['notification'],
                        'location' => $validatedData['location'],
                        'link' => $validatedData['link'],
                        'tag_id' => $validatedData['tag_id'], // タグの保存
                        'description' => $validatedData['description'],
                        'recurrence_type' => $validatedData['recurrence_type'], // 繰り返しの種類の保存
                        'recurrence_date' => $recurrenceDay, // recurrence_dateを保存
                    ]);
                }
            }
    
            return response()->json(['message' => 'Monthly events created successfully'], 201);
        } catch (\Exception $e) {
            Log::error('Error creating monthly events:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(MonthlyEventRequest $request, $id)
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
    
            $event = MonthlyEvent::find($id);
            if (!$event) return response()->json(['error' => 'イベントが見つかりません'], 404);
    
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
                'recurrence_date' => $validatedData['recurrence_date'],
            ]);
    
            return response()->json(['message' => 'Monthly event updated successfully'], 200);
        } catch (\Exception $e) {
            Log::error('Error updating monthly event:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $req, $id)
    {
        try {
            $event = MonthlyEvent::find($id);
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
            MonthlyEvent::where('event_id', $eventId)->delete();

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}