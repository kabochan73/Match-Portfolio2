<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

describe('forgot password', function () {
    it('sends a reset link that points to the frontend reset page', function () {
        Notification::fake();
        $user = User::factory()->create(['email' => 'taro@example.com']);

        $this->postJson('/api/seeker/forgot-password', ['email' => 'taro@example.com'])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;

            return str_starts_with($url, 'http://localhost:3000/reset-password?')
                && str_contains($url, 'token='.$notification->token)
                && str_contains($url, 'email=taro%40example.com');
        });
    });

    it('returns the same response without sending mail when the email is not registered', function () {
        Notification::fake();
        User::factory()->create(['email' => 'taro@example.com']);

        $registered = $this->postJson('/api/seeker/forgot-password', ['email' => 'taro@example.com']);
        $unregistered = $this->postJson('/api/seeker/forgot-password', ['email' => 'nobody@example.com']);

        $unregistered->assertOk()->assertExactJson($registered->json());
        Notification::assertSentTimes(ResetPassword::class, 1);
    });

    it('returns 422 when the email is missing', function () {
        $this->postJson('/api/seeker/forgot-password', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    });
});

describe('reset password', function () {
    it('changes the password with a valid token', function () {
        $user = User::factory()->create(['email' => 'taro@example.com']);
        $token = Password::broker('users')->createToken($user);

        $this->postJson('/api/seeker/reset-password', [
            'token' => $token,
            'email' => 'taro@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertOk();

        expect(Hash::check('new-password123', $user->fresh()->password))->toBeTrue();
    });

    it('returns 422 without changing the password when the token is invalid', function () {
        $user = User::factory()->create(['email' => 'taro@example.com']);

        $this->postJson('/api/seeker/reset-password', [
            'token' => 'invalid-token',
            'email' => 'taro@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        expect(Hash::check('password', $user->fresh()->password))->toBeTrue();
    });
});
