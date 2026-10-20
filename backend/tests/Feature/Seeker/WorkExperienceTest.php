<?php

use App\Enums\EmploymentType;
use App\Models\User;
use App\Models\WorkExperience;

/**
 * @return array<string, string|null>
 */
function validWorkExperience(array $overrides = []): array
{
    return array_merge([
        'company_name' => '株式会社テックマッチ',
        'started_on' => '2022-04',
        'ended_on' => '2025-03',
        'employment_type' => 'full_time',
    ], $overrides);
}

describe('store', function () {
    it('adds a work experience saved on the first day of the month', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/work-experiences', validWorkExperience())
            ->assertCreated()
            ->assertJsonPath('data.started_on', '2022-04')
            ->assertJsonPath('data.ended_on', '2025-03')
            ->assertJsonPath('data.employment_type.label', '正社員');

        $workExperience = $user->workExperiences()->sole();
        expect($workExperience->started_on->toDateString())->toBe('2022-04-01')
            ->and($workExperience->ended_on->toDateString())->toBe('2025-03-01');
    });

    it('adds a current job when the end month is empty', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/work-experiences', validWorkExperience(['ended_on' => null]))
            ->assertCreated()
            ->assertJsonPath('data.ended_on', null);
    });

    it('allows the end month to be the same as the start month', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/seeker/work-experiences', validWorkExperience(['started_on' => '2024-04', 'ended_on' => '2024-04']))
            ->assertCreated();
    });

    it('returns 422 with Japanese messages for invalid input', function (array $input, string $field, string $message) {
        $this->travelTo('2026-10-20');

        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/seeker/work-experiences', validWorkExperience($input))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field => $message]);
    })->with([
        'end before start' => [['started_on' => '2024-04', 'ended_on' => '2024-03'], 'ended_on', '退社年月には、入社年月以降の日付を指定してください。'],
        'future start' => [['started_on' => '2026-11', 'ended_on' => null], 'started_on', '入社年月に、未来の年月は指定できません。'],
        'future end' => [['ended_on' => '2026-11'], 'ended_on', '退社年月に、未来の年月は指定できません。'],
        'wrong format' => [['started_on' => '2024/04'], 'started_on', '入社年月は、2024-04のような年月で指定してください。'],
        'unknown employment type' => [['employment_type' => 'boss'], 'employment_type', '選択された雇用形態は無効です。'],
        'missing company name' => [['company_name' => ''], 'company_name', '会社名は必須項目です。'],
    ]);

    it('returns 401 when not logged in', function () {
        $this->postJson('/api/seeker/work-experiences', validWorkExperience())->assertUnauthorized();
    });
});

describe('update', function () {
    it('updates the seeker\'s own work experience', function () {
        $user = User::factory()->create();
        $workExperience = WorkExperience::factory()->for($user)->create();

        $this->actingAs($user, 'web')
            ->putJson("/api/seeker/work-experiences/{$workExperience->id}", validWorkExperience([
                'company_name' => '株式会社リネーム',
                'ended_on' => null,
                'employment_type' => 'freelance',
            ]))
            ->assertOk()
            ->assertJsonPath('data.company_name', '株式会社リネーム');

        expect($workExperience->fresh())
            ->company_name->toBe('株式会社リネーム')
            ->ended_on->toBeNull()
            ->employment_type->toBe(EmploymentType::Freelance);
    });

    it('returns 403 without changing another seeker\'s work experience', function () {
        $workExperience = WorkExperience::factory()->create(['company_name' => '他人の会社']);

        $this->actingAs(User::factory()->create(), 'web')
            ->putJson("/api/seeker/work-experiences/{$workExperience->id}", validWorkExperience())
            ->assertForbidden();

        expect($workExperience->fresh()->company_name)->toBe('他人の会社');
    });

    it('returns 404 when the work experience does not exist', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->putJson('/api/seeker/work-experiences/999999', validWorkExperience())
            ->assertNotFound();
    });
});

describe('destroy', function () {
    it('deletes the seeker\'s own work experience', function () {
        $user = User::factory()->create();
        $workExperience = WorkExperience::factory()->for($user)->create();

        $this->actingAs($user, 'web')
            ->deleteJson("/api/seeker/work-experiences/{$workExperience->id}")
            ->assertNoContent();

        $this->assertModelMissing($workExperience);
    });

    it('returns 403 without deleting another seeker\'s work experience', function () {
        $workExperience = WorkExperience::factory()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->deleteJson("/api/seeker/work-experiences/{$workExperience->id}")
            ->assertForbidden();

        $this->assertModelExists($workExperience);
    });
});
