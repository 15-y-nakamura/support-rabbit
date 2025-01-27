<?php

use App\Http\Controllers\Api\Achievement\AchievementController;
use Illuminate\Support\Facades\Route;

Route::prefix('v2')->group(function () {
    Route::get('/achievements', [AchievementController::class, 'index']);
});