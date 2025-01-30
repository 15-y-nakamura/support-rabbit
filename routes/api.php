<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\LoginController as ApiLoginController;
use App\Http\Controllers\Api\Auth\LogoutController as ApiLogoutController;
use App\Http\Controllers\Api\Auth\RegisterController as ApiRegisterController;
use App\Http\Controllers\Api\Auth\PasswordResetController as ApiPasswordResetController;
use App\Http\Controllers\Api\Profile\ProfileController as ApiProfileController;
use App\Http\Controllers\Api\Calendar\EventController;
use App\Http\Controllers\Api\Calendar\TagController;
use App\Http\Controllers\Api\Calendar\WeekdayEventsController;
use App\Http\Controllers\Api\Notice\NoticeController;
use App\Http\Controllers\Api\Achievement\AchievementController;

Route::prefix('v2/auth')->middleware('guest')->group(function () {
    Route::post('register', [ApiRegisterController::class, 'signup']);
    Route::post('login', [ApiLoginController::class, 'login']);
    Route::post('forgot-password', [ApiPasswordResetController::class, 'sendPasswordResetLink']);
    Route::post('reset-password', [ApiPasswordResetController::class, 'resetPassword']);
});

Route::prefix('v2')->middleware('auth:sanctum')->group(function () {
    Route::post('logout', [ApiLogoutController::class, 'logout']);

    //プロフィール API
    Route::controller(ApiProfileController::class)->prefix('profile')->group(function () {
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
        Route::post('/',  'store'); 
        Route::delete('{id}', 'destroy');
        Route::delete('{id}/all', 'destroyAll');
    });

    //通知 API
    Route::controller(NoticeController::class)->prefix('notices')->group(function () {
        Route::get('/', 'index');
        Route::put('read', 'read');
    });

    //実績 API
    Route::get('achievements', [AchievementController::class, 'index']);
});
