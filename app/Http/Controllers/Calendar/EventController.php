<?php

namespace App\Http\Controllers\Calendar;

use App\Models\CalendarEvent;
use App\Models\UserToken;
use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\EventRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EventController extends Controller
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
            Log::warning('【カレンダーイベント】認証失敗: トークンが無効または期限切れ');
            throw new \Exception('ユーザーが認証されていません');
        }

        return $userToken;
    }

    /**
     * ユーザーのカレンダーイベントを取得
     */
    public function index(Request $req)
    {
        try {
            $userToken = $this->authenticateUser($req);

            $calendarEvents = CalendarEvent::with([
                    'weekday_events', 'weekend_events', 'weekly_events', 'monthly_events', 'yearly_events', 'tag'
                ])
                ->where('user_id', $userToken->user_id)
                // 繰り返しイベントのイベントを表示しない
                ->where('is_recurring', 0)
                ->orderBy('id', 'desc');

            // 検索条件によるフィルタリング
            // ユーザーのIDと一致するイベントのみ取得
            if ($req->has('userId')) {
                $calendarEvents = $calendarEvents->where('user_id', $req->userId);
            }

            // 検索処理にてイベントタイトルに特定のキーワードが含まれているものを検索
            if ($req->has('searchQuery')) {
                $calendarEvents = $calendarEvents->where('title', 'like', '%' . $req->searchQuery . '%');
            }
            

            // 検索処理にてタグ検索が行われた場合、タグIDに一致するイベントのみ取得
            if ($req->has('tagIds')) {
                $calendarEvents = $calendarEvents->whereHas('tags', function ($query) use ($req) {
                    $query->whereIn('id', $req->tagIds);
                });
            }

            $events = $calendarEvents->get();

            return response()->json(['events' => $events]);
        } catch (\Exception $e) {
            return response(['error' => 'カレンダーイベントの取得に失敗しました'], 500);
        }
    }

    /**
     * カレンダーイベントを作成
     */
    public function store(EventRequest $req)
    {
        try {
            $userToken = $this->authenticateUser($req);

            $validated = $req->validated();

            $event = CalendarEvent::create(array_merge($validated, ['user_id' => $userToken->user_id]));

            if (isset($validated['tag_id'])) {
                $event->tag_id = $validated['tag_id'];
                $event->save();
            }

            return response()->json(['message' => 'イベントが作成されました', 'event' => $event], 201);
        } catch (\Exception $e) {
            return response(['error' => 'イベントの作成に失敗しました'], 500);
        }
    }

    /**
     * 指定したイベントを取得
     */
    public function show(Request $req, $id)
    {
        try {
            $event = CalendarEvent::with(['tag', 'weekday_events', 'weekend_events', 'weekly_events', 'monthly_events', 'yearly_events'])->find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント】取得失敗: イベントが見つかりません', ['event_id' => $id]);
                return response(['error' => 'イベントが見つかりません'], 404);
            }

            return response()->json($event);
        } catch (\Exception $e) {
            return response(['error' => 'イベントの取得に失敗しました'], 500);
        }
    }

    /**
     * イベントを更新
     */
    public function update(EventRequest $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント】更新失敗: イベントが見つかりません', ['event_id' => $id]);
                return response(['error' => 'イベントが見つかりません'], 404);
            }

            $validated = $req->validated();
            $event->update($validated);

            if (isset($validated['tag_id'])) {
                $event->tag_id = $validated['tag_id'];
                $event->save();
            }

             // 関連する繰り返しイベントの更新処理
                switch ($event->recurrence_type) {
                    case 'weekday':
                        app('App\Http\Controllers\Calendar\WeekdayEventsController')->update($req, $event->id);
                        break;
                    case 'weekend':
                        app('App\Http\Controllers\Calendar\WeekendEventsController')->update($req, $event->id);
                        break;
                    case 'weekly':
                        app('App\Http\Controllers\Calendar\WeeklyEventsController')->update($req, $event->id);
                        break;
                    case 'monthly':
                        app('App\Http\Controllers\Calendar\MonthlyEventsController')->update($req, $event->id);
                        break;
                    case 'yearly':
                        app('App\Http\Controllers\Calendar\YearlyEventsController')->update($req, $event->id);
                        break;
                }
            return response()->json(['message' => 'イベントが更新されました'], 200);
        } catch (\Exception $e) {
            return response(['error' => 'イベントの更新に失敗しました'], 500);
        }
    }

    /**
     * イベントを削除
     */
    public function destroy(Request $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント】削除失敗: イベントが見つかりません', ['event_id' => $id]);
                return response(['error' => 'イベントが見つかりません'], 404);
            }

            Log::info('【カレンダーイベント】削除処理を開始します', ['event_id' => $id]);
            $event->delete();
            Log::info('【カレンダーイベント】削除処理が完了しました', ['event_id' => $id]);

            return response()->json(['message' => 'イベントが削除されました'], 200);
        } catch (\Exception $e) {
            Log::error('【カレンダーイベント】削除処理中にエラーが発生しました', ['event_id' => $id, 'error' => $e->getMessage()]);
            return response(['error' => 'イベントの削除に失敗しました'], 500);
        }
    }

    /**
     * 繰り返しイベントを含むすべての関連イベントを削除
     */
    public function destroyAll(Request $req, $id)
    {
        try {
            $event = CalendarEvent::find($id);
            if (!$event) {
                Log::warning('【カレンダーイベント】削除失敗: イベントが見つかりません', ['event_id' => $id]);
                return response(['error' => 'イベントが見つかりません'], 404);
            }

            Log::info('【カレンダーイベント】すべての関連イベントの削除処理を開始します', ['event_id' => $id]);

            // 繰り返しイベントを含むすべての関連イベントを削除
            CalendarEvent::where('recurrence_type', $event->recurrence_type)
                ->where('recurrence_dates', $event->recurrence_dates)
                ->delete();

            Log::info('【カレンダーイベント】すべての関連イベントの削除処理が完了しました', ['event_id' => $id]);

            return response()->json(['message' => 'すべての関連イベントが削除されました'], 200);
        } catch (\Exception $e) {
            Log::error('【カレンダーイベント】すべての関連イベントの削除処理中にエラーが発生しました', ['event_id' => $id, 'error' => $e->getMessage()]);
            return response(['error' => 'すべての関連イベントの削除に失敗しました'], 500);
        }
    }
}