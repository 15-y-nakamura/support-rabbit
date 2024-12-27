<?php

use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Profile\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ホームページルート
Route::get('/', function () {
    return Inertia::render('Auth/AuthForm');
})->name('auth.toggle');

// ホームルート
Route::get('/home', function () {
    return Inertia::render('Home');
})->middleware(['auth', 'verified'])->name('home');

// ゲスト専用ルート
Route::middleware('guest')->group(function () {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('register', [RegisterController::class, 'store']);
    Route::post('api/register', [RegisterController::class, 'signup']);
    Route::post('login', [LoginController::class, 'login']);

    Route::get('forgot-password', function () {
        return Inertia::render('Auth/ForgotPassword');
    })->name('password.request');

    Route::post('forgot-password', [PasswordResetController::class, 'sendPasswordResetLink'])
        ->name('password.email');

    Route::get('reset-password/{token}', function ($token) {
        return Inertia::render('Auth/ResetPassword', ['token' => $token]);
    })->name('password.reset');

    Route::post('reset-password', [PasswordResetController::class, 'resetPassword'])
        ->name('password.update');
});

// 認証済みユーザー専用ルート
Route::middleware('auth')->group(function () {
    Route::get('verify-email/{id}/{hash}', [EmailVerificationController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('logout', [LogoutController::class, 'logout'])
        ->name('logout');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('profile/show', [ProfileController::class, 'show'])->name('profile.show');
});
