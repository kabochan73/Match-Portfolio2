<?php

namespace App\Providers;

use App\Models\Company;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // パスワード再設定メールのリンクを、Laravelの画面ではなくNext.jsの再設定画面に向ける(求職者と企業で画面が別)
        ResetPassword::createUrlUsing(function (CanResetPassword $notifiable, string $token): string {
            $path = $notifiable instanceof Company ? '/company/reset-password' : '/reset-password';

            return config('app.frontend_url').$path.'?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });
    }
}
