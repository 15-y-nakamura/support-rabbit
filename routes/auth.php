<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;

Route::prefix('v2')->middleware('guest')->group(function () {
    Route::post('register', [RegisterController::class, 'signup']);
    Route::post('login', [LoginController::class, 'login']);
    Route::post('forgot-password', [PasswordResetController::class, 'sendPasswordResetLink']);
    Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);
});

Route::prefix('v2')->middleware('auth:sanctum')->group(function () {
    Route::post('logout', [LogoutController::class, 'logout']);
});