<?php

namespace App\Http\Controllers\Api\Calendar;

use App\Http\Controllers\Controller;
use App\Models\WeekdayEvent;
use Illuminate\Http\Request;
use Carbon\CarbonPeriod;

class WeekdayEventsController extends Controller
{
    public function index()
    {
        try {
            $events = WeekdayEvent::all();
            return response()->json($events);
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
                    ]);
                }
            }

            return response()->json(['message' => 'Weekday events created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
