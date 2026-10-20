<?php

use App\Http\Controllers\Seeker\AuthController as SeekerAuthController;
use Illuminate\Support\Facades\Route;

// 求職者本人の操作(/api/seeker/...)
Route::prefix('seeker')->group(function () {
    Route::post('register', [SeekerAuthController::class, 'register']);
    Route::post('login', [SeekerAuthController::class, 'login']);

    Route::middleware('auth:web')->group(function () {
        Route::post('logout', [SeekerAuthController::class, 'logout']);
        Route::get('me', [SeekerAuthController::class, 'me']);
    });
});
