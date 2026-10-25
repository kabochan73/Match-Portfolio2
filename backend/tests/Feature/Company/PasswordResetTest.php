<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Symfony\Component\Mailer\Exception\TransportException;

describe('forgot password', function () {
    it('sends a reset link that points to the company reset page', function () {
        Notification::fake();
        $company = Company::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/company/forgot-password', ['email' => 'hr@example.com'])
            ->assertOk();

        Notification::assertSentTo($company, ResetPassword::class, function (ResetPassword $notification) use ($company) {
            return str_starts_with(
                $notification->toMail($company)->actionUrl,
                'http://localhost:3000/company/reset-password?',
            );
        });
    });

    it('returns the same response without sending mail when the email is not registered', function () {
        Notification::fake();
        Company::factory()->create(['email' => 'hr@example.com']);

        $registered = $this->postJson('/api/company/forgot-password', ['email' => 'hr@example.com']);
        $unregistered = $this->postJson('/api/company/forgot-password', ['email' => 'nobody@example.com']);

        $unregistered->assertOk()->assertExactJson($registered->json());
        Notification::assertSentTimes(ResetPassword::class, 1);
    });

    it('does not send mail to a seeker who has the same email', function () {
        Notification::fake();
        $seeker = User::factory()->create(['email' => 'shared@example.com']);

        $this->postJson('/api/company/forgot-password', ['email' => 'shared@example.com'])
            ->assertOk();

        Notification::assertNotSentTo($seeker, ResetPassword::class);
    });

    it('returns the same response and reports the error when the mail cannot be sent', function () {
        Exceptions::fake();
        Company::factory()->create(['email' => 'hr@example.com']);
        // 誰も待ち受けていないポートのSMTPに向け、メールの送信を実際に失敗させる
        config(['mail.default' => 'smtp', 'mail.mailers.smtp.host' => '127.0.0.1', 'mail.mailers.smtp.port' => 1]);

        $this->postJson('/api/company/forgot-password', ['email' => 'hr@example.com'])
            ->assertOk()
            ->assertJsonPath('message', '登録されているメールアドレスであれば、パスワード再設定用のメールを送信しました。');

        Exceptions::assertReported(TransportException::class);
    });
});

describe('reset password', function () {
    it('changes the password with a valid token', function () {
        $company = Company::factory()->create(['email' => 'hr@example.com']);
        $token = Password::broker('companies')->createToken($company);

        $this->postJson('/api/company/reset-password', [
            'token' => $token,
            'email' => 'hr@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertOk();

        expect(Hash::check('new-password123', $company->fresh()->password))->toBeTrue();
    });

    it('returns 422 without changing the password when the token is invalid', function () {
        $company = Company::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/company/reset-password', [
            'token' => 'invalid-token',
            'email' => 'hr@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertUnprocessable()->assertJsonValidationErrors(['email' => 'このパスワード再設定トークンは無効です。']);

        expect(Hash::check('password', $company->fresh()->password))->toBeTrue();
    });

    it('rejects a seeker token for a company with the same email', function () {
        $seeker = User::factory()->create(['email' => 'shared@example.com']);
        $company = Company::factory()->create(['email' => 'shared@example.com']);
        $seekerToken = Password::broker('users')->createToken($seeker);

        $this->postJson('/api/company/reset-password', [
            'token' => $seekerToken,
            'email' => 'shared@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertUnprocessable();

        expect(Hash::check('password', $company->fresh()->password))->toBeTrue();
    });

    it('does not change the seeker password when a company with the same email resets', function () {
        $seeker = User::factory()->create(['email' => 'shared@example.com']);
        $company = Company::factory()->create(['email' => 'shared@example.com']);
        $companyToken = Password::broker('companies')->createToken($company);

        $this->postJson('/api/company/reset-password', [
            'token' => $companyToken,
            'email' => 'shared@example.com',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertOk();

        expect(Hash::check('password', $seeker->fresh()->password))->toBeTrue();
    });
});
