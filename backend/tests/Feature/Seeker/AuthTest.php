<?php

use App\Models\Company;
use App\Models\User;

describe('register', function () {
    /**
     * @return array<string, string>
     */
    function validRegistration(array $overrides = []): array
    {
        return array_merge([
            'name' => '山田 太郎',
            'email' => 'taro@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'birth_date' => '2000-04-01',
        ], $overrides);
    }

    it('creates a seeker and logs them in', function () {
        $response = $this->postJson('/api/seeker/register', validRegistration());

        $response->assertCreated()
            ->assertJsonPath('data.email', 'taro@example.com')
            ->assertJsonPath('data.birth_date', '2000-04-01')
            ->assertJsonMissingPath('data.password');
        $this->assertDatabaseHas('users', ['email' => 'taro@example.com']);
        $this->assertAuthenticatedAs(User::firstWhere('email', 'taro@example.com'), 'web');
    });

    it('returns 422 when the seeker is younger than 18', function () {
        $this->travelTo('2026-10-20');

        $this->postJson('/api/seeker/register', validRegistration(['birth_date' => '2008-10-21']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['birth_date' => '18歳以上の方のみ登録できます。']);
    });

    it('accepts a seeker who turns 18 today and one who is still 60', function (string $birthDate) {
        $this->travelTo('2026-10-20');

        $this->postJson('/api/seeker/register', validRegistration(['birth_date' => $birthDate]))
            ->assertCreated();
    })->with([
        '18th birthday today' => '2008-10-20',
        'day before 61st birthday' => '1965-10-21',
    ]);

    it('returns 422 when the seeker is 61 or older', function () {
        $this->travelTo('2026-10-20');

        $this->postJson('/api/seeker/register', validRegistration(['birth_date' => '1965-10-20']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['birth_date' => '60歳以下の方のみ登録できます。']);
    });

    it('returns 422 when the email is already registered', function () {
        User::factory()->create(['email' => 'taro@example.com']);

        $this->postJson('/api/seeker/register', validRegistration())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => '指定のメールアドレスは既に使用されています。']);
    });

    it('returns 422 when required fields are missing', function () {
        $this->postJson('/api/seeker/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email' => 'メールアドレスは必須項目です。', 'password', 'birth_date']);
    });

    it('logs out the company session when a seeker registers', function () {
        $this->actingAs(Company::factory()->create(), 'company');

        $this->postJson('/api/seeker/register', validRegistration())->assertCreated();

        $this->assertGuest('company');
    });
});

describe('login', function () {
    it('logs in with the correct password', function () {
        $user = User::factory()->create(['email' => 'taro@example.com']);

        $this->postJson('/api/seeker/login', ['email' => 'taro@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->assertAuthenticatedAs($user, 'web');
    });

    it('returns 422 without logging in when the password is wrong', function () {
        User::factory()->create(['email' => 'taro@example.com']);

        $this->postJson('/api/seeker/login', ['email' => 'taro@example.com', 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'メールアドレスまたはパスワードが正しくありません。']);

        $this->assertGuest('web');
    });

    it('rejects the sixth attempt within a minute even with the correct password', function () {
        User::factory()->create(['email' => 'taro@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/seeker/login', ['email' => 'taro@example.com', 'password' => 'wrong-password']);
        }

        $this->postJson('/api/seeker/login', ['email' => 'taro@example.com', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'ログインの試行回数が多すぎます。']);

        $this->assertGuest('web');
    });

    it('logs out the company session when a seeker logs in', function () {
        User::factory()->create(['email' => 'taro@example.com']);
        $this->actingAs(Company::factory()->create(), 'company');

        $this->postJson('/api/seeker/login', ['email' => 'taro@example.com', 'password' => 'password'])
            ->assertOk();

        $this->assertGuest('company');
    });
});

describe('logout', function () {
    it('logs the seeker out', function () {
        $this->actingAs(User::factory()->create(), 'web');

        $this->postJson('/api/seeker/logout')->assertNoContent();

        $this->assertGuest('web');
    });

    it('returns 401 when not logged in', function () {
        $this->postJson('/api/seeker/logout')->assertUnauthorized();
    });
});

describe('me', function () {
    it('returns the logged-in seeker without the password', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonMissingPath('data.password');
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/seeker/me')->assertUnauthorized();
    });

    it('returns 401 when logged in as a company', function () {
        $this->actingAs(Company::factory()->create(), 'company')
            ->getJson('/api/seeker/me')
            ->assertUnauthorized();
    });
});
