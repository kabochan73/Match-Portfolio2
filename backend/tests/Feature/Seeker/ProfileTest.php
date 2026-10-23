<?php

use App\Enums\EmploymentType;
use App\Models\Certification;
use App\Models\Company;
use App\Models\Education;
use App\Models\User;
use App\Models\WorkExperience;

describe('show', function () {
    it('returns the profile with work experiences, educations, and certifications', function () {
        $user = User::factory()->create();
        WorkExperience::factory()->for($user)->create([
            'company_name' => '株式会社A',
            'started_on' => '2020-04-01',
            'ended_on' => '2023-03-01',
            'employment_type' => EmploymentType::FullTime,
        ]);
        WorkExperience::factory()->for($user)->current()->create([
            'company_name' => '株式会社B',
            'started_on' => '2023-04-01',
        ]);
        Education::factory()->for($user)->create(['school_name' => '東都大学 情報工学部']);
        Certification::factory()->for($user)->create(['name' => '基本情報技術者']);

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/profile')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            // 職歴は在籍開始の新しい順
            ->assertJsonPath('data.work_experiences.0.company_name', '株式会社B')
            ->assertJsonPath('data.work_experiences.0.ended_on', null)
            ->assertJsonPath('data.work_experiences.1.started_on', '2020-04')
            ->assertJsonPath('data.work_experiences.1.ended_on', '2023-03')
            ->assertJsonPath('data.work_experiences.1.employment_type', ['value' => 'full_time', 'label' => '正社員'])
            ->assertJsonPath('data.educations.0.school_name', '東都大学 情報工学部')
            ->assertJsonPath('data.certifications.0.name', '基本情報技術者');
    });

    it('does not include another seeker\'s work experiences', function () {
        $user = User::factory()->create();
        WorkExperience::factory()->create(['company_name' => '他人の会社']);

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/profile')
            ->assertOk()
            ->assertJsonCount(0, 'data.work_experiences');
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/seeker/profile')->assertUnauthorized();
    });

    it('returns 401 when logged in as a company', function () {
        $this->actingAs(Company::factory()->create(), 'company')
            ->getJson('/api/seeker/profile')
            ->assertUnauthorized();
    });
});

describe('update', function () {
    it('updates the basic information', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/seeker/profile', [
                'name' => '山田 花子',
                'birth_date' => '1995-05-05',
                'comment' => 'Laravelが得意です。',
                'portfolio_url' => 'https://github.com/example',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', '山田 花子')
            ->assertJsonPath('data.birth_date', '1995-05-05');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => '山田 花子',
            'comment' => 'Laravelが得意です。',
            'portfolio_url' => 'https://github.com/example',
        ]);
    });

    it('clears the optional fields when they are sent as null', function () {
        $user = User::factory()->create(['comment' => '旧コメント', 'portfolio_url' => 'https://old.example.com']);

        $this->actingAs($user, 'web')
            ->putJson('/api/seeker/profile', [
                'name' => $user->name,
                'birth_date' => $user->birth_date->toDateString(),
                'comment' => null,
                'portfolio_url' => null,
            ])
            ->assertOk();

        expect($user->fresh())
            ->comment->toBeNull()
            ->portfolio_url->toBeNull();
    });

    it('does not change the email even if it is sent', function () {
        $user = User::factory()->create(['email' => 'taro@example.com']);

        $this->actingAs($user, 'web')
            ->putJson('/api/seeker/profile', [
                'name' => $user->name,
                'birth_date' => $user->birth_date->toDateString(),
                'email' => 'changed@example.com',
            ])
            ->assertOk();

        expect($user->fresh()->email)->toBe('taro@example.com');
    });

    it('returns 422 with Japanese messages for invalid input', function () {
        $this->travelTo('2026-10-20');
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/seeker/profile', [
                'name' => $user->name,
                'birth_date' => '2010-01-01',
                'comment' => str_repeat('あ', 201),
                'portfolio_url' => 'not-a-url',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'birth_date' => '18歳以上の方のみ登録できます。',
                'comment' => '自己紹介の文字数は、200文字以下である必要があります。',
                'portfolio_url' => 'ポートフォリオURLは、有効なURL形式で指定してください。',
            ]);
    });

    it('accepts only http and https for the portfolio URL', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/seeker/profile', [
                'name' => $user->name,
                'birth_date' => $user->birth_date->toDateString(),
                'portfolio_url' => 'ftp://example.com',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'portfolio_url' => 'ポートフォリオURLは、有効なURL形式で指定してください。',
            ]);
    });

    it('returns 401 when not logged in', function () {
        $this->putJson('/api/seeker/profile', [])->assertUnauthorized();
    });
});

it('does not include work experiences in /me', function () {
    $user = User::factory()->create();
    WorkExperience::factory()->for($user)->create();

    $this->actingAs($user, 'web')
        ->getJson('/api/seeker/me')
        ->assertOk()
        ->assertJsonMissingPath('data.work_experiences');
});
