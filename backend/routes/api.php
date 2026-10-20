<?php

use App\Http\Controllers\Company\AuthController as CompanyAuthController;
use App\Http\Controllers\Seeker\AuthController as SeekerAuthController;
use App\Http\Controllers\Seeker\PasswordResetController as SeekerPasswordResetController;
use Illuminate\Support\Facades\Route;

// 求職者本人の操作(/api/seeker/...)
Route::prefix('seeker')->group(function () {
    Route::post('register', [SeekerAuthController::class, 'register']);
    Route::post('login', [SeekerAuthController::class, 'login']);
    Route::post('forgot-password', [SeekerPasswordResetController::class, 'forgotPassword']);
    Route::post('reset-password', [SeekerPasswordResetController::class, 'resetPassword']);

    Route::middleware('auth:web')->group(function () {
        Route::post('logout', [SeekerAuthController::class, 'logout']);
        Route::get('me', [SeekerAuthController::class, 'me']);
    });
});

// 企業本人の操作(/api/company/...)
Route::prefix('company')->group(function () {
    Route::post('register', [CompanyAuthController::class, 'register']);
    Route::post('login', [CompanyAuthController::class, 'login']);

    Route::middleware('auth:company')->group(function () {
        Route::post('logout', [CompanyAuthController::class, 'logout']);
        Route::get('me', [CompanyAuthController::class, 'me']);
    });
});
