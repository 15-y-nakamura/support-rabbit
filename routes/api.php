<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Calendar\EventController;
use App\Http\Controllers\Calendar\TagController;
use App\Http\Controllers\Calendar\WeekdayEventsController;
use App\Http\Controllers\Calendar\WeekendEventsController;
use App\Http\Controllers\Calendar\WeeklyEventsController;
use App\Http\Controllers\Calendar\MonthlyEventsController;
use App\Http\Controllers\Calendar\YearlyEventsController;
use App\Http\Controllers\Notice\NoticeController;
use App\Http\Controllers\Achievement\AchievementController; // 正しい名前空間を指定

Route::prefix('v2/auth')->middleware('guest')->group(function () {
    Route::post('register', [RegisterController::class, 'signup']);
    Route::post('login', [LoginController::class, 'login']);
    Route::post('forgot-password', [PasswordResetController::class, 'sendPasswordResetLink']);
    Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);
});

Route::prefix('v2')->group(function () {
    Route::post('logout', [LogoutController::class, 'logout']);

    //プロフィール API
    Route::controller(ProfileController::class)->prefix('profile')->group(function () {
        Route::get('/', 'show'); // API でプロフィール取得
    });

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

    //Weekday イベント API
    Route::controller(WeekdayEventsController::class)->prefix('calendar/weekday-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update'); // update ルートを追加
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //Weekend イベント API
    Route::controller(WeekendEventsController::class)->prefix('calendar/weekend-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update'); // update ルートを追加
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //Weekly イベント API
    Route::controller(WeeklyEventsController::class)->prefix('calendar/weekly-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update'); // update ルートを追加
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //Monthly イベント API
    Route::controller(MonthlyEventsController::class)->prefix('calendar/monthly-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update'); // update ルートを追加
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //Yearly イベント API
    Route::controller(YearlyEventsController::class)->prefix('calendar/yearly-events')->group(function () {
        Route::get('/', 'index');
        Route::get('{id}', 'show');
        Route::post('/', 'store'); 
        Route::put('{id}', 'update'); // update ルートを追加
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    // 実績 API
    Route::controller(AchievementController::class)->prefix('achievements')->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
    });
});