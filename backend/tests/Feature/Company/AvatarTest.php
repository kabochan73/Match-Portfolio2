<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

describe('store', function () {
    it('saves the logo as a 400px square and returns its URL', function () {
        Storage::fake();
        $company = Company::factory()->create();

        $response = $this->actingAs($company, 'company')
            ->post('/api/company/avatar', ['avatar' => UploadedFile::fake()->image('logo.png', 800, 500)], ['Accept' => 'application/json']);

        $path = $company->fresh()->avatar_path;
        $response->assertOk()->assertJsonPath('data.avatar_url', Storage::url($path));
        expect($path)->toStartWith('avatars/companies/');
        expect(getimagesizefromstring(Storage::get($path)))->toMatchArray([0 => 400, 1 => 400]);
    });

    it('deletes the previous logo when it is replaced', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $this->actingAs($company, 'company')
            ->post('/api/company/avatar', ['avatar' => UploadedFile::fake()->image('old.png', 500, 500)], ['Accept' => 'application/json']);
        $oldPath = $company->fresh()->avatar_path;

        $this->post('/api/company/avatar', ['avatar' => UploadedFile::fake()->image('new.png', 500, 500)], ['Accept' => 'application/json'])
            ->assertOk();

        Storage::assertMissing($oldPath);
    });

    it('calls the field ロゴ画像 in the error messages', function (UploadedFile $file, string $message) {
        Storage::fake();

        $this->actingAs(Company::factory()->create(), 'company')
            ->post('/api/company/avatar', ['avatar' => $file], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar' => $message]);
    })->with([
        'not an image' => [fn () => UploadedFile::fake()->create('logo.pdf', 100, 'application/pdf'), 'ロゴ画像には、JPEG・PNG・WebPの画像を指定してください。'],
        'larger than 5MB' => [fn () => UploadedFile::fake()->image('logo.png')->size(5121), 'ロゴ画像は、5MB以下のファイルを指定してください。'],
    ]);

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/company/avatar')
            ->assertUnauthorized();
    });
});

describe('destroy', function () {
    it('deletes the logo file and clears the URL', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $this->actingAs($company, 'company')
            ->post('/api/company/avatar', ['avatar' => UploadedFile::fake()->image('logo.png', 500, 500)], ['Accept' => 'application/json']);
        $path = $company->fresh()->avatar_path;

        $this->deleteJson('/api/company/avatar')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null);

        Storage::assertMissing($path);
    });

    it('returns 401 when not logged in', function () {
        $this->deleteJson('/api/company/avatar')->assertUnauthorized();
    });
});
