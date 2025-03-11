<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Calendar\EventController;
use App\Http\Controllers\Calendar\TagController;
use App\Http\Controllers\Calendar\WeekdayEventsController;
use App\Http\Controllers\Calendar\WeekendEventsController;
use App\Http\Controllers\Calendar\WeeklyEventsController;
use App\Http\Controllers\Calendar\MonthlyEventsController;
use App\Http\Controllers\Calendar\YearlyEventsController;
use App\Http\Controllers\Achievement\AchievementController; 


Route::prefix('v2')->group(function () {
    //カレンダーイベント API
    Route::controller(EventController::class)->prefix('calendar/events')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('{id}', 'show');
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //カレンダータグ API
    Route::controller(TagController::class)->prefix('calendar/tags')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('{id}', 'show');
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
    });

    //平日 イベント API
    Route::controller(WeekdayEventsController::class)->prefix('calendar/weekday-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //週末 イベント API
    Route::controller(WeekendEventsController::class)->prefix('calendar/weekend-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //毎週 イベント API
    Route::controller(WeeklyEventsController::class)->prefix('calendar/weekly-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //毎月 イベント API
    Route::controller(MonthlyEventsController::class)->prefix('calendar/monthly-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //毎年 イベント API
    Route::controller(YearlyEventsController::class)->prefix('calendar/yearly-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update');
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    // 達成数 API
    Route::controller(AchievementController::class)->prefix('achievements')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
    });
});