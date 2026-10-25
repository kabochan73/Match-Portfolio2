<?php

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| 認証まわりのIPごとの回数制限
|--------------------------------------------------------------------------
|
| 本番ではNext.jsが中継し、元のIPをX-Forwarded-Forで渡すため、テストでも同じヘッダーでIPを指定する。
| 別のIPなら制限されないことで、中継元のヘッダーからIPを読めていることも確かめる
|
*/

/**
 * 指定のIPから来たリクエストとして送る
 */
function fromIp(string $ip): TestCase
{
    return test()->withHeader('X-Forwarded-For', $ip);
}

it('limits login attempts per IP even when the email changes each time', function () {
    foreach (range(1, 20) as $attempt) {
        fromIp('203.0.113.1')
            ->postJson('/api/seeker/login', ['email' => "user{$attempt}@example.com", 'password' => 'wrong-password'])
            ->assertUnprocessable();
    }

    fromIp('203.0.113.1')
        ->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'wrong-password'])
        ->assertTooManyRequests();

    // 別のIPからは、今までどおりログインを試せる
    fromIp('203.0.113.2')
        ->postJson('/api/seeker/login', ['email' => 'user1@example.com', 'password' => 'wrong-password'])
        ->assertUnprocessable();
});

it('limits registration to 10 per hour per IP', function () {
    foreach (range(1, 10) as $attempt) {
        fromIp('203.0.113.1')->postJson('/api/seeker/register', [])->assertUnprocessable();
    }

    fromIp('203.0.113.1')->postJson('/api/company/register', [])->assertTooManyRequests();
    fromIp('203.0.113.2')->postJson('/api/seeker/register', [])->assertUnprocessable();
});

it('limits password reset requests to 5 per minute per IP', function () {
    foreach (range(1, 5) as $attempt) {
        fromIp('203.0.113.1')
            ->postJson('/api/seeker/forgot-password', ['email' => "user{$attempt}@example.com"])
            ->assertOk();
    }

    fromIp('203.0.113.1')->postJson('/api/company/reset-password', [])->assertTooManyRequests();
    fromIp('203.0.113.2')
        ->postJson('/api/seeker/forgot-password', ['email' => 'user1@example.com'])
        ->assertOk();
});
