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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/home', function () {
    return Inertia::render('Home');
})->middleware(['auth', 'verified'])->name('home');

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisterController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisterController::class, 'store']);

    Route::post('api/register', [RegisterController::class, 'signup']);

    Route::get('login', [LoginController::class, 'create'])
        ->name('login');

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

Route::middleware('auth')->group(function () {
    Route::get('verify-email/{id}/{hash}', [EmailVerificationController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationController::class, 'resendVerificationEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('logout', [LogoutController::class, 'logout'])
        ->name('logout');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit'); // ルートを変更
    Route::get('profile/show', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('api/v2/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('api/v2/profile/password', [ProfileController::class, 'password'])->name('profile.password'); // putメソッドを使用
    Route::delete('api/v2/profile/delete', [ProfileController::class, 'destroy'])->name('profile.destroy'); // deleteメソッドを追加
});
