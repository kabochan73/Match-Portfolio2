<?php

use App\Models\Education;
use App\Models\User;

describe('store', function () {
    it('adds an education', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/educations', ['school_name' => '東都大学 情報工学部'])
            ->assertCreated()
            ->assertJsonPath('data.school_name', '東都大学 情報工学部');

        expect($user->educations()->sole()->school_name)->toBe('東都大学 情報工学部');
    });

    it('returns 422 with a Japanese message when the school name is missing', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/seeker/educations', ['school_name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['school_name' => '学校名は必須項目です。']);
    });

    it('returns 401 when not logged in', function () {
        $this->postJson('/api/seeker/educations', ['school_name' => '東都大学'])->assertUnauthorized();
    });
});

describe('update', function () {
    it('updates the seeker\'s own education', function () {
        $user = User::factory()->create();
        $education = Education::factory()->for($user)->create();

        $this->actingAs($user, 'web')
            ->putJson("/api/seeker/educations/{$education->id}", ['school_name' => '西峰大学 理工学部'])
            ->assertOk()
            ->assertJsonPath('data.school_name', '西峰大学 理工学部');

        expect($education->fresh()->school_name)->toBe('西峰大学 理工学部');
    });

    it('returns 403 without changing another seeker\'s education', function () {
        $education = Education::factory()->create(['school_name' => '他人の学校']);

        $this->actingAs(User::factory()->create(), 'web')
            ->putJson("/api/seeker/educations/{$education->id}", ['school_name' => '書き換え'])
            ->assertForbidden();

        expect($education->fresh()->school_name)->toBe('他人の学校');
    });
});

describe('destroy', function () {
    it('deletes the seeker\'s own education', function () {
        $user = User::factory()->create();
        $education = Education::factory()->for($user)->create();

        $this->actingAs($user, 'web')
            ->deleteJson("/api/seeker/educations/{$education->id}")
            ->assertNoContent();

        $this->assertModelMissing($education);
    });

    it('returns 403 without deleting another seeker\'s education', function () {
        $education = Education::factory()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->deleteJson("/api/seeker/educations/{$education->id}")
            ->assertForbidden();

        $this->assertModelExists($education);
    });
});
