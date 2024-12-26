<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Profile\ProfileController;

Route::prefix('v2')->middleware('auth:sanctum')->group(function () {
    Route::get('profiles', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('profiles/edit', [ProfileController::class, 'edit'])->name('profile.edit'); // 更新対象のデータを取得するためのGETメソッドを追加
    Route::put('profiles', [ProfileController::class, 'update'])->name('profile.update'); // putメソッドを使用
    Route::put('profiles/password', [ProfileController::class, 'password'])->name('profile.password'); // putメソッドを使用
    Route::get('profiles/delete', [ProfileController::class, 'confirmDelete'])->name('profile.confirmDelete'); // 削除対象のデータを取得するためのGETメソッドを追加
    Route::delete('profiles', [ProfileController::class, 'destroy'])->name('profile.destroy'); // deleteメソッドを使用
});
