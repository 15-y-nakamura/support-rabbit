<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Profile\ProfileController;

Route::prefix('v2')->middleware('auth:sanctum')->group(function () {
    Route::get('profiles', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('profiles/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profiles', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profiles/password', [ProfileController::class, 'password'])->name('profile.password');
    Route::get('profiles/delete', [ProfileController::class, 'confirmDelete'])->name('profile.confirmDelete');
    Route::delete('profiles', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
