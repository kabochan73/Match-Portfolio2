<?php

namespace App\Providers;

use App\Models\Company;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
        $this->configureRateLimiting();

        // パスワード再設定メールのリンクを、Laravelの画面ではなくNext.jsの再設定画面に向ける(求職者と企業で画面が別)
        ResetPassword::createUrlUsing(function (CanResetPassword $notifiable, string $token): string {
            $path = $notifiable instanceof Company ? '/company/reset-password' : '/reset-password';

            return config('app.frontend_url').$path.'?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        });
    }

    /**
     * 認証まわりのIPごとの回数制限(求職者・企業で共通。ルートでthrottle:名前として使う)。
     * ログインはメールアドレスごとの制限(ThrottlesLogins)もあり、こちらはアドレスを変えながらの総当たりを防ぐ
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(20)->by($request->ip()));
        RateLimiter::for('register', fn (Request $request) => Limit::perHour(10)->by($request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
    }
}
