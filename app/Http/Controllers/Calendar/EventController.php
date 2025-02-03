<?php
namespace App\Http\Controllers\Calendar;

use App\Models\CalendarEvent;
use App\Models\RecurringEvent;
use App\Models\UserToken;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\EventRequest;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EventController extends Controller
{
    public function index(Request $req)
    {
        try {
            Log::info('Fetching calendar events with parameters:', $req->all());

            $calendarEvents = CalendarEvent::with(['weekday_events', 'weekend_events', 'weekly_events', 'monthly_events', 'yearly_events', 'tag'])->where('is_recurring', 0)->orderBy('id', 'desc');

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
                    // 'user_id' => $event->user_id,
                    'title' => $event->title,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'all_day' => $event->all_day,
                    'notification' => $event->notification,
                    'location' => $event->location,
                    'link' => $event->link,
                    'tag_id' => $event->tag_id,
                    'description' => $event->description,
                    'is_recurring' => $event->is_recurring,
                    'recurrence_type' => $event->recurrence_type,
                    'weekday_events' => $event->weekday_events,
                    'weekend_events' => $event->weekend_events,
                    'weekly_events' => $event->weekly_events,
                    'monthly_events' => $event->monthly_events,
                    'yearly_events' => $event->yearly_events,
                ];
            });

            return response()->json(['events' => $res]);
        } catch (\Exception $e) {
            Log::error('Error fetching events: ' . $e->getMessage(), ['exception' => $e]);
            return response(['error' => 'Internal Server Error'], 500);
        }
    }


    public function store(EventRequest $req)
    {
        try {
            // トークンを使用してユーザーを認証
            $token = $req->bearerToken();
            Log::info('Received Token:', ['token' => $token]);
            $userToken = UserToken::where('token', $token)->where('expiration_time', '>', now())->first();
    
            if (!$userToken) {
                throw new \Exception('User not authenticated');
            }
    
            $validated = $req->validated();
            Log::info('Validated Data:', $validated);
    
            $event = CalendarEvent::create(array_merge($validated, ['user_id' => $userToken->user_id]));
    
            if (isset($validated['tag_id'])) {
                $event->tag_id = $validated['tag_id'];
                $event->save();
            }
    
            return response()->json(['message' => 'イベントが作成されました', 'event' => $event], 201);
        } catch (\Exception $e) {
            Log::error('Error creating event: ' . $e->getMessage(), ['exception' => $e]);
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $req, $id)
    {
        try {
            $event = CalendarEvent::with(['tag', 'weekday_events', 'weekend_events', 'weekly_events', 'monthly_events', 'yearly_events'])->find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            return response()->json([
                'id' => $event->id,
                // 'user_id' => $event->user_id,
                'title' => $event->title,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'all_day' => $event->all_day,
                'notification' => $event->notification,
                'location' => $event->location,
                'link' => $event->link,
                'tag_id' => $event->tag_id,
                'description' => $event->description,
                'is_recurring' => $event->is_recurring,
                'recurrence_type' => $event->recurrence_type,
                'weekday_events' => $event->weekday_events,
                'weekend_events' => $event->weekend_events,
                'weekly_events' => $event->weekly_events,
                'monthly_events' => $event->monthly_events,
                'yearly_events' => $event->yearly_events,
            ]);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }

    public function update(EventRequest $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            $validated = $req->validated();

            $event->update($validated);

            if (isset($validated['tag_id'])) {
                $event->tag_id = $validated['tag_id'];
                $event->save();
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

    public function destroyAll(Request $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) return response(['error' => 'イベントが見つかりません'], 404);

            // 繰り返しイベントを含むすべての関連イベントを削除
            CalendarEvent::where('recurrence_type', $event->recurrence_type)
                ->where('recurrence_dates', $event->recurrence_dates)
                ->delete();

            // 関連するweekdayイベントも削除
            app('App\Http\Controllers\Calendar\WeekdayEventsController')->destroyAll($event->id);
            app('App\Http\Controllers\Calendar\WeekendEventsController')->destroyAll($event->id);
            app('App\Http\Controllers\Calendar\WeeklyEventsController')->destroyAll($event->id);
            app('App\Http\Controllers\Calendar\MonthlyEventsController')->destroyAll($event->id);
            app('App\Http\Controllers\Calendar\YearlyEventsController')->destroyAll($event->id);

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            return response(['error' => $e->getMessage()], 500);
        }
    }
}