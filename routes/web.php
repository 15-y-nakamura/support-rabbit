<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Profile\ProfileController;

// 誰でもアクセス可能なルート（ログイン・登録・パスワードリセット）
Route::get('login', [LoginController::class, 'create'])->name('login');
Route::post('login', [LoginController::class, 'login']);

Route::get('register', [RegisterController::class, 'create'])->name('register');
Route::post('register', [RegisterController::class, 'store']);

Route::get('forgot-password', fn() => Inertia::render('Auth/ForgotPasswordForm'))->name('password.request');
Route::post('forgot-password', [PasswordResetController::class, 'sendPasswordResetLink'])->name('password.email');

Route::get('reset-password/{token}', fn($token) => Inertia::render('Auth/ResetPasswordForm', ['token' => $token]))->name('password.reset');
Route::post('reset-password', [PasswordResetController::class, 'resetPassword'])->name('password.update');

// 認証済みユーザー専用ルート（プロフィール・ログアウト）
Route::middleware('auth')->prefix('user')->group(function () {
    Route::post('logout', [LogoutController::class, 'logout'])->name('logout');

    Route::controller(ProfileController::class)->prefix('profile')->group(function () {
        Route::get('/edit', fn() => Inertia::render('Profile/Profile'))->name('profile.edit'); // 修正
        Route::put('/', 'update')->name('profile.update');
        Route::put('/password', 'password')->name('profile.password');
        Route::delete('/', 'destroy')->name('profile.destroy');
    });

    // カレンダールート（認証済みユーザーのみ）
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/calendar', fn() => Inertia::render('Calendar/Calendar'))->name('calendar');
    });

    // Web UI 向けルート
    Route::get('weather', fn() => Inertia::render('Weather/Weather'))->name('weather');
    Route::get('achievement', fn() => Inertia::render('Achievement/Achievement'))->name('achievement');
});