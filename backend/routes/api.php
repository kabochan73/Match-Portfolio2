<?php

use App\Http\Controllers\Company\AuthController as CompanyAuthController;
use App\Http\Controllers\Company\AvatarController as CompanyAvatarController;
use App\Http\Controllers\Company\PasswordResetController as CompanyPasswordResetController;
use App\Http\Controllers\Company\ProfileController as CompanyProfileController;
use App\Http\Controllers\Seeker\AuthController as SeekerAuthController;
use App\Http\Controllers\Seeker\AvatarController as SeekerAvatarController;
use App\Http\Controllers\Seeker\CertificationController as SeekerCertificationController;
use App\Http\Controllers\Seeker\EducationController as SeekerEducationController;
use App\Http\Controllers\Seeker\PasswordResetController as SeekerPasswordResetController;
use App\Http\Controllers\Seeker\ProfileController as SeekerProfileController;
use App\Http\Controllers\Seeker\WorkExperienceController as SeekerWorkExperienceController;
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

        Route::get('profile', [SeekerProfileController::class, 'show']);
        Route::put('profile', [SeekerProfileController::class, 'update']);
        Route::post('avatar', [SeekerAvatarController::class, 'store']);
        Route::delete('avatar', [SeekerAvatarController::class, 'destroy']);

        Route::apiResource('work-experiences', SeekerWorkExperienceController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('educations', SeekerEducationController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('certifications', SeekerCertificationController::class)->only(['store', 'update', 'destroy']);
    });
});

// 企業本人の操作(/api/company/...)
Route::prefix('company')->group(function () {
    Route::post('register', [CompanyAuthController::class, 'register']);
    Route::post('login', [CompanyAuthController::class, 'login']);
    Route::post('forgot-password', [CompanyPasswordResetController::class, 'forgotPassword']);
    Route::post('reset-password', [CompanyPasswordResetController::class, 'resetPassword']);

    Route::middleware('auth:company')->group(function () {
        Route::post('logout', [CompanyAuthController::class, 'logout']);
        Route::get('me', [CompanyAuthController::class, 'me']);

        Route::get('profile', [CompanyProfileController::class, 'show']);
        Route::put('profile', [CompanyProfileController::class, 'update']);
        Route::post('avatar', [CompanyAvatarController::class, 'store']);
        Route::delete('avatar', [CompanyAvatarController::class, 'destroy']);
    });
});
