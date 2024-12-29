<?php

namespace App\Http\Controllers\Api\Calendar;

use App\Models\Event;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\CalendarEventRequest;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    public function index(Request $req)
    {
        try {
            $result = Event::orderBy('id', 'desc');

            // 検索条件がある場合はフィルタリング
            if ($req->has('searchQuery')) {
                $result = $result->where('title', 'like', '%' . $req->searchQuery . '%');
            }
            if ($req->has('userId')) {
                $result = $result->where('user_id', $req->userId);
            }
            if ($req->has('isVisible')) {
                $result = $result->where('is_visible', $req->isVisible);
            }
            if ($req->has('tagIds')) {
                $result = $result->whereHas('tags', function ($query) use ($req) {
                    $query->whereIn('id', $req->tagIds);
                });
            }

            $events = $result->get();
            $res = $events->map(function ($event) {
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
                    'latitude' => $event->latitude, // 緯度
                    'longitude' => $event->longitude, // 経度
                    'tags' => $event->tags->pluck('id'),
                ];
            });

            return response()->json(['events' => $res]);
        } catch (\Exception $e) {
            return response([], 500);
        }
    }

    public function store(CalendarEventRequest $req)
    {
        try {
            $validated = $req->validated();

            $event = Event::create(array_merge($validated, ['user_id' => $req->user()->id]));

            if (isset($validated['tags'])) {
                $event->tags()->sync($validated['tags']);
            }

            return response()->json(['message' => 'イベントが作成されました'], 201);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $req, $id)
    {
        try {
            $event = Event::find($id);
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
                'latitude' => $event->latitude, // 緯度
                'longitude' => $event->longitude, // 経度
                'tags' => $event->tags->pluck('id'),
            ]);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function update(CalendarEventRequest $req, $id)
    {
        try {
            $event = Event::find($id);
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
            $event = Event::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            $event->delete();

            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }
}
