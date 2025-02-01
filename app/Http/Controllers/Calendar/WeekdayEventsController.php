<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\WeekdayEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;

class WeekdayEventsController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('query');
        $events = WeekdayEvent::with('tag')->where('title', 'like', '%' . $query . '%')->get();
        return response()->json($events);
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

    public function store(Request $request)
    {
        try {
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
                'recurrence_type' => 'required|in:none,weekday,weekend,weekly,monthly,yearly', // 繰り返しの種類のバリデーション
                'tag_id' => 'nullable|integer|exists:calendar_tags,id', // タグのバリデーション
            ]);

            $startDate = new \DateTime($validatedData['start_time']);
            $endDate = new \DateTime($validatedData['end_time'] ?? $validatedData['start_time']);

            $period = CarbonPeriod::create($startDate, $endDate);

            foreach ($period as $date) {
                if ($date->isWeekday()) {
                    WeekdayEvent::create([
                        'event_id' => $validatedData['event_id'],
                        'title' => $validatedData['title'],
                        'description' => $validatedData['description'],
                        'start_time' => $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['start_time']))->format('H:i'),
                        'end_time' => $validatedData['end_time'] ? $date->format('Y-m-d') . 'T' . (new \DateTime($validatedData['end_time']))->format('H:i') : null,
                        'all_day' => $validatedData['all_day'],
                        'location' => $validatedData['location'],
                        'link' => $validatedData['link'],
                        'notification' => $validatedData['notification'],
                        'recurrence_type' => $validatedData['recurrence_type'], // 繰り返しの種類の保存
                        'tag_id' => $validatedData['tag_id'], // タグの保存
                    ]);
                }
            }

            return response()->json(['message' => 'Weekday events created successfully'], 201);
        } catch (\Exception $e) {
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