<?php

use App\Models\Certification;
use App\Models\User;

describe('store', function () {
    it('adds a certification', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/certifications', ['name' => '基本情報技術者'])
            ->assertCreated()
            ->assertJsonPath('data.name', '基本情報技術者');

        expect($user->certifications()->sole()->name)->toBe('基本情報技術者');
    });

    it('returns 422 instead of a server error when the seeker already has the certification', function () {
        $user = User::factory()->create();
        Certification::factory()->for($user)->create(['name' => '基本情報技術者']);

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/certifications', ['name' => '基本情報技術者'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name' => 'その資格はすでに登録されています。']);
    });

    it('allows a certification that another seeker already has', function () {
        Certification::factory()->create(['name' => '基本情報技術者']);

        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/seeker/certifications', ['name' => '基本情報技術者'])
            ->assertCreated();
    });

    it('calls the field 資格名 in the required message', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/seeker/certifications', ['name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name' => '資格名は必須項目です。']);
    });

    it('returns 401 when not logged in', function () {
        $this->postJson('/api/seeker/certifications', ['name' => '基本情報技術者'])->assertUnauthorized();
    });
});

describe('update', function () {
    it('updates the seeker\'s own certification', function () {
        $user = User::factory()->create();
        $certification = Certification::factory()->for($user)->create(['name' => '基本情報技術者']);

        $this->actingAs($user, 'web')
            ->putJson("/api/seeker/certifications/{$certification->id}", ['name' => '応用情報技術者'])
            ->assertOk()
            ->assertJsonPath('data.name', '応用情報技術者');
    });

    it('allows saving the certification with its current name', function () {
        $user = User::factory()->create();
        $certification = Certification::factory()->for($user)->create(['name' => '基本情報技術者']);

        $this->actingAs($user, 'web')
            ->putJson("/api/seeker/certifications/{$certification->id}", ['name' => '基本情報技術者'])
            ->assertOk();
    });

    it('returns 422 when renaming to another certification the seeker already has', function () {
        $user = User::factory()->create();
        Certification::factory()->for($user)->create(['name' => '応用情報技術者']);
        $certification = Certification::factory()->for($user)->create(['name' => '基本情報技術者']);

        $this->actingAs($user, 'web')
            ->putJson("/api/seeker/certifications/{$certification->id}", ['name' => '応用情報技術者'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name' => 'その資格はすでに登録されています。']);
    });

    it('returns 403 without changing another seeker\'s certification', function () {
        $certification = Certification::factory()->create(['name' => '基本情報技術者']);

        $this->actingAs(User::factory()->create(), 'web')
            ->putJson("/api/seeker/certifications/{$certification->id}", ['name' => '書き換え'])
            ->assertForbidden();

        expect($certification->fresh()->name)->toBe('基本情報技術者');
    });
});

describe('destroy', function () {
    it('deletes the seeker\'s own certification', function () {
        $user = User::factory()->create();
        $certification = Certification::factory()->for($user)->create();

        $this->actingAs($user, 'web')
            ->deleteJson("/api/seeker/certifications/{$certification->id}")
            ->assertNoContent();

        $this->assertModelMissing($certification);
    });

    it('returns 403 without deleting another seeker\'s certification', function () {
        $certification = Certification::factory()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->deleteJson("/api/seeker/certifications/{$certification->id}")
            ->assertForbidden();

        $this->assertModelExists($certification);
    });
});
