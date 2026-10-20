<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('store', function () {
    it('saves the avatar as a 400px square and returns its URL', function () {
        Storage::fake();
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')
            ->post('/api/seeker/avatar', ['avatar' => UploadedFile::fake()->image('me.jpg', 1000, 800)], ['Accept' => 'application/json']);

        $path = $user->fresh()->avatar_path;
        $response->assertOk()->assertJsonPath('data.avatar_url', Storage::url($path));
        expect($path)->toStartWith('avatars/users/');
        expect(getimagesizefromstring(Storage::get($path)))->toMatchArray([0 => 400, 1 => 400]);
    });

    it('deletes the previous avatar when it is replaced', function () {
        Storage::fake();
        $user = User::factory()->create();
        $this->actingAs($user, 'web')
            ->post('/api/seeker/avatar', ['avatar' => UploadedFile::fake()->image('old.jpg', 500, 500)], ['Accept' => 'application/json']);
        $oldPath = $user->fresh()->avatar_path;

        $this->post('/api/seeker/avatar', ['avatar' => UploadedFile::fake()->image('new.jpg', 500, 500)], ['Accept' => 'application/json'])
            ->assertOk();

        Storage::assertMissing($oldPath);
        Storage::assertExists($user->fresh()->avatar_path);
    });

    it('returns 422 when the file is not a JPEG, PNG, or WebP image', function () {
        Storage::fake();

        $this->actingAs(User::factory()->create(), 'web')
            ->post('/api/seeker/avatar', ['avatar' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf')], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar' => 'アイコン画像には、JPEG・PNG・WebPの画像を指定してください。']);
    });

    it('returns 422 when the file is larger than 5MB', function () {
        Storage::fake();

        $this->actingAs(User::factory()->create(), 'web')
            ->post('/api/seeker/avatar', ['avatar' => UploadedFile::fake()->image('huge.jpg')->size(5121)], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar' => 'アイコン画像は、5MB以下のファイルを指定してください。']);
    });

    it('returns 401 when not logged in', function () {
        $this->postJson('/api/seeker/avatar')->assertUnauthorized();
    });
});

describe('destroy', function () {
    it('deletes the avatar file and clears the URL', function () {
        Storage::fake();
        $user = User::factory()->create();
        $this->actingAs($user, 'web')
            ->post('/api/seeker/avatar', ['avatar' => UploadedFile::fake()->image('me.jpg', 500, 500)], ['Accept' => 'application/json']);
        $path = $user->fresh()->avatar_path;

        $this->deleteJson('/api/seeker/avatar')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null);

        Storage::assertMissing($path);
        expect($user->fresh()->avatar_path)->toBeNull();
    });

    it('returns 401 when not logged in', function () {
        $this->deleteJson('/api/seeker/avatar')->assertUnauthorized();
    });
});
