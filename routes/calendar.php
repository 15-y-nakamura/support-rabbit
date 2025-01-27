<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Calendar\EventController;
use App\Http\Controllers\Api\Calendar\TagController;
use App\Http\Controllers\Api\Notice\NoticeController;
use App\Http\Controllers\Api\Calendar\WeekdayEventsController;

Route::prefix('v2')->group(function () {
    // カレンダーイベントのルート
    Route::get('calendar/events', [EventController::class, 'index']);
    Route::post('calendar/events', [EventController::class, 'store']);
    Route::get('calendar/events/{id}', [EventController::class, 'show']);
    Route::put('calendar/events/{id}', [EventController::class, 'update']);
    Route::delete('calendar/events/{id}', [EventController::class, 'destroy']);
    Route::delete('calendar/events/{id}/all', [EventController::class, 'destroyAll']); // 変更

    // カレンダータグのルート
    Route::get('calendar/tags', [TagController::class, 'index']);
    Route::post('calendar/tags', [TagController::class, 'store']);
    Route::get('calendar/tags/{id}', [TagController::class, 'show']);
    Route::put('calendar/tags/{id}', [TagController::class, 'update']);
    Route::delete('calendar/tags/{id}', [TagController::class, 'destroy']);

    // 通知のルート
    Route::get('notices', [NoticeController::class, 'index']);
    Route::put('notices/read', [NoticeController::class, 'read']);

    // Weekdayイベントのルート
    Route::delete('calendar/weekday-events/{id}', [WeekdayEventsController::class, 'destroy']); // 変更
    Route::delete('calendar/weekday-events/{id}/all', [WeekdayEventsController::class, 'destroyAll']); // 変更
});