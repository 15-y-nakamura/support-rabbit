<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Calendar\CalendarEventController;
use App\Http\Controllers\Api\Calendar\CalendarTagController;
use App\Http\Controllers\Api\Notice\NoticeController;

Route::prefix('v2')->group(function () {
    // カレンダーイベントのルート
    Route::get('calendar/events', [CalendarEventController::class, 'index']);
    Route::post('calendar/events', [CalendarEventController::class, 'store']);
    Route::get('calendar/events/{id}', [CalendarEventController::class, 'show']);
    Route::put('calendar/events/{id}', [CalendarEventController::class, 'update']);
    Route::delete('calendar/events/{id}', [CalendarEventController::class, 'destroy']);

    // カレンダータグのルート
    Route::get('calendar/tags', [CalendarTagController::class, 'index']);
    Route::post('calendar/tags', [CalendarTagController::class, 'store']);
    Route::get('calendar/tags/{id}', [CalendarTagController::class, 'show']);
    Route::put('calendar/tags/{id}', [CalendarTagController::class, 'update']);
    Route::delete('calendar/tags/{id}', [CalendarTagController::class, 'destroy']);

    // 通知のルート
    Route::get('notices', [NoticeController::class, 'index']);
    Route::put('notices/read', [NoticeController::class, 'read']);
});
