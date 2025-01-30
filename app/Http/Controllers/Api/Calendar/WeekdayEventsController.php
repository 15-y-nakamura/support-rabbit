<?php

namespace App\Http\Controllers\Api\Calendar;

use App\Http\Controllers\Controller;
use App\Models\WeekdayEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;

class WeekdayEventsController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user(); // 認証ユーザーを取得
            $events = WeekdayEvent::where('user_id', $user->id)->get(); // 自分のデータのみ取得
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    

    public function store(Request $request)
    {
        try {
            $user = $request->user(); // 🔹 認証ユーザーを取得
    
            $validatedData = $request->validate([
                'event_id' => 'required|integer|exists:calendar_events,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'start_time' => 'required|date_format:Y-m-d\TH:i',
                'end_time' => 'nullable|date_format:Y-m-d\TH:i|after_or_equal:start_time',
                'all_day' => 'required|boolean',
                'location' => 'nullable|string|max:255',
                'link' => 'nullable|url|max:255',
                'notification' => 'nullable|string|in:none,10minutes,1hour',
                'recurrence_type' => 'required|in:none,weekday,weekend,weekly,monthly,yearly',
            ]);
    
            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);
    
            $period = CarbonPeriod::create($startDate, $endDate);
    
            foreach ($period as $date) {
                if ($date->isWeekday()) {
                    WeekdayEvent::create([
                        'user_id' => $user->id, // 🔹 ユーザーIDを保存
                        'event_id' => $validatedData['event_id'],
                        'title' => $validatedData['title'],
                        'description' => $validatedData['description'],
                        'start_time' => $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['start_time']))->format('H:i'),
                        'end_time' => $validatedData['end_time'] ? $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['end_time']))->format('H:i') : null,
                        'all_day' => $validatedData['all_day'],
                        'location' => $validatedData['location'],
                        'link' => $validatedData['link'],
                        'notification' => $validatedData['notification'],
                        'recurrence_type' => $validatedData['recurrence_type'],
                    ]);
                }
            }
    
            return response()->json(['message' => 'Weekday events created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    

    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $event = WeekdayEvent::where('id', $id)->where('user_id', $user->id)->first(); // 🔹 自分のイベントのみ取得
            if (!$event) {
                return response()->json(['error' => 'イベントが見つかりません'], 404);
            }
    
            $event->delete();
    
            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    

    public function destroyAll(Request $request, $eventId)
    {
        try {
            $user = $request->user();
            $deletedCount = WeekdayEvent::where('event_id', $eventId)->where('user_id', $user->id)->delete();
    
            if ($deletedCount === 0) {
                return response()->json(['error' => '削除するイベントが見つかりません'], 404);
            }
    
            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
}
