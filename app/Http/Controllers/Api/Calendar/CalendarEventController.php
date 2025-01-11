<?php

namespace App\Http\Controllers\Api\Calendar;

use App\Models\CalendarEvent;
use App\Models\RecurringEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\CalendarEventRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log; // 追加

class CalendarEventController extends Controller
{
    public function index(Request $req)
    {
        try {
            $calendarEvents = CalendarEvent::with('weekday_events')->where('is_recurring', 0)->orderBy('id', 'desc');

            // 検索条件がある場合はフィルタリング
            if ($req->has('searchQuery')) {
                $calendarEvents = $calendarEvents->where('title', 'like', '%' . $req->searchQuery . '%');
            }
            if ($req->has('userId')) {
                $calendarEvents = $calendarEvents->where('user_id', $req->userId);
            }
            if ($req->has('isVisible')) {
                $calendarEvents = $calendarEvents->where('is_visible', $req->isVisible);
            }
            if ($req->has('tagIds')) {
                $calendarEvents = $calendarEvents->whereHas('tags', function ($query) use ($req) {
                    $query->whereIn('id', $req->tagIds);
                });
            }

            $calendarEvents = $calendarEvents->get();

            // ログにイベントIDを記録
            Log::info('Fetched calendar events:', ['ids' => $calendarEvents->pluck('id')]);

            $res = $calendarEvents->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'all_day' => $event->all_day,
                    'location' => $event->location,
                    'link' => $event->link,
                    'notification' => $event->notification,
                    'is_recurring' => $event->is_recurring,
                    'recurrence_type' => $event->recurrence_type,
                    'recurrence_dates' => $event->recurrence_dates,
                    'recurrence_days' => $event->recurrence_days,
                    'recurrence_start_time' => $event->recurrence_start_time,
                    'recurrence_end_time' => $event->recurrence_end_time,
                    'tag_id' => $event->tag_id,
                    'weekday_events' => $event->weekday_events,
                ];
            });

            return response()->json(['events' => $res]);
        } catch (\Exception $e) {
            Log::error('Error fetching events: ' . $e->getMessage(), ['exception' => $e]);
            return response(['error' => 'Internal Server Error'], 500);
        }
    }

    public function store(CalendarEventRequest $req)
    {
        try {
            $validated = $req->validated();

            $event = CalendarEvent::create(array_merge($validated, ['user_id' => $req->user()->id]));

            if (isset($validated['tags'])) {
                $event->tags()->sync($validated['tags']);
            }

            return response()->json(['message' => 'イベントが作成されました', 'event' => $event], 201);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            return response()->json([
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'all_day' => $event->all_day,
                'location' => $event->location,
                'link' => $event->link,
                'notification' => $event->notification,
                'is_recurring' => $event->is_recurring,
                'recurrence_type' => $event->recurrence_type,
                'recurrence_dates' => $event->recurrence_dates,
                'recurrence_days' => $event->recurrence_days,
                'recurrence_start_time' => $event->recurrence_start_time,
                'recurrence_end_time' => $event->recurrence_end_time,
                'tag_id' => $event->tag_id,
            ]);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function update(CalendarEventRequest $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            $validated = $req->validated();

            $event->update($validated);

            if (isset($validated['tags'])) {
                $event->tags()->sync($validated['tags']);
            }

            return response()->json(['message' => 'イベントが更新されました'], 200);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            $event->delete();

            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }
}
