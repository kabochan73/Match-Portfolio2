<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * 求職者・企業のログイン試行回数の制限(1分に5回まで)。
 * キーは「ガード名+メールアドレス(小文字)+IPアドレス」。同じメールアドレスへの総当たりと、同じIPからの連続試行を1つのカウントで防ぐ。
 * 求職者と企業はテーブルが別で、同じメールアドレスが両方に存在しうるため、キーの先頭にガード名を含めて区別する
 */
trait ThrottlesLogins
{
    private const MAX_LOGIN_ATTEMPTS = 5;

    /**
     * 試行回数が上限に達していれば、待ち時間を含むエラーを返す
     *
     * @throws ValidationException
     */
    private function ensureIsNotRateLimited(Request $request, string $guard): void
    {
        $key = $this->throttleKey($request, $guard);

        if (! RateLimiter::tooManyAttempts($key, self::MAX_LOGIN_ATTEMPTS)) {
            return;
        }

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', ['seconds' => RateLimiter::availableIn($key)]),
        ]);
    }

    private function hitRateLimiter(Request $request, string $guard): void
    {
        RateLimiter::hit($this->throttleKey($request, $guard));
    }

    private function clearRateLimiter(Request $request, string $guard): void
    {
        RateLimiter::clear($this->throttleKey($request, $guard));
    }

    private function throttleKey(Request $request, string $guard): string
    {
        return Str::transliterate($guard.'|'.Str::lower($request->string('email')->toString()).'|'.$request->ip());
    }
}
