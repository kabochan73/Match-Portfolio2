<?php

use App\Enums\Prefecture;
use App\Models\Company;
use App\Models\User;

describe('register', function () {
    /**
     * @return array<string, string>
     */
    function validCompanyRegistration(array $overrides = []): array
    {
        return array_merge([
            'name' => '株式会社テックマッチ',
            'email' => 'hr@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $overrides);
    }

    it('creates a company with only the required fields and logs it in', function () {
        $response = $this->postJson('/api/company/register', validCompanyRegistration());

        $response->assertCreated()
            ->assertJsonPath('data.name', '株式会社テックマッチ')
            ->assertJsonPath('data.introduction', null)
            ->assertJsonMissingPath('data.password');
        $this->assertAuthenticatedAs(Company::firstWhere('email', 'hr@example.com'), 'company');
    });

    it('allows the same email address that a seeker already uses', function () {
        User::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/company/register', validCompanyRegistration())
            ->assertCreated();
    });

    it('returns 422 when the email is already registered by another company', function () {
        Company::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/company/register', validCompanyRegistration())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    });

    it('returns 422 when required fields are missing', function () {
        $this->postJson('/api/company/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    });

    it('logs out the seeker session when a company registers', function () {
        $this->actingAs(User::factory()->create(), 'web');

        $this->postJson('/api/company/register', validCompanyRegistration())->assertCreated();

        $this->assertGuest('web');
    });
});

describe('login', function () {
    it('logs in with the correct password', function () {
        $company = Company::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.id', $company->id);

        $this->assertAuthenticatedAs($company, 'company');
    });

    it('returns 422 without logging in when the password is wrong', function () {
        Company::factory()->create(['email' => 'hr@example.com']);

        $this->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest('company');
    });

    it('rejects the sixth attempt within a minute even with the correct password', function () {
        Company::factory()->create(['email' => 'hr@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'wrong-password']);
        }

        $this->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest('company');
    });

    it('does not count failed seeker logins with the same email toward the company limit', function () {
        Company::factory()->create(['email' => 'hr@example.com']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/api/seeker/login', ['email' => 'hr@example.com', 'password' => 'wrong-password']);
        }

        $this->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'password'])
            ->assertOk();
    });

    it('logs out the seeker session when a company logs in', function () {
        Company::factory()->create(['email' => 'hr@example.com']);
        $this->actingAs(User::factory()->create(), 'web');

        $this->postJson('/api/company/login', ['email' => 'hr@example.com', 'password' => 'password'])
            ->assertOk();

        $this->assertGuest('web');
    });
});

describe('logout', function () {
    it('logs the company out', function () {
        $this->actingAs(Company::factory()->create(), 'company');

        $this->postJson('/api/company/logout')->assertNoContent();

        $this->assertGuest('company');
    });

    it('returns 401 when not logged in', function () {
        $this->postJson('/api/company/logout')->assertUnauthorized();
    });
});

describe('me', function () {
    it('returns the logged-in company with its profile and prefecture label', function () {
        $company = Company::factory()->withProfile()->create(['prefecture' => Prefecture::Tokyo]);

        $this->actingAs($company, 'company')
            ->getJson('/api/company/me')
            ->assertOk()
            ->assertJsonPath('data.id', $company->id)
            ->assertJsonPath('data.prefecture', ['value' => 'tokyo', 'label' => '東京'])
            ->assertJsonMissingPath('data.password');
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/company/me')->assertUnauthorized();
    });

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->getJson('/api/company/me')
            ->assertUnauthorized();
    });
});
