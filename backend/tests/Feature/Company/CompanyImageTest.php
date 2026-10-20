<?php

use App\Models\Company;
use App\Models\CompanyImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

/**
 * 写真をアップロードする(multipartのため、postJsonではなくpostでAcceptを付けて送る)
 */
function uploadCompanyImage(UploadedFile $file): TestResponse
{
    return test()->post('/api/company/images', ['image' => $file], ['Accept' => 'application/json']);
}

describe('store', function () {
    it('adds a photo scaled down to fit within 1600x1200', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $this->actingAs($company, 'company');

        $response = uploadCompanyImage(UploadedFile::fake()->image('office.jpg', 3200, 2400));

        $image = $company->images()->sole();
        $response->assertCreated()
            ->assertJsonPath('data.id', $image->id)
            ->assertJsonPath('data.url', Storage::url($image->path));
        expect(getimagesizefromstring(Storage::get($image->path)))->toMatchArray([0 => 1600, 1 => 1200]);
    });

    it('returns 422 when the company already has 5 photos', function () {
        Storage::fake();
        $company = Company::factory()->create();
        CompanyImage::factory()->count(5)->for($company)->create();
        $this->actingAs($company, 'company');

        uploadCompanyImage(UploadedFile::fake()->image('sixth.jpg', 800, 600))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image' => 'ギャラリーの写真は5枚までです。']);

        expect($company->images()->count())->toBe(5);
        expect(Storage::allFiles())->toBe([]);
    });

    it('does not count another company\'s photos toward the limit', function () {
        Storage::fake();
        CompanyImage::factory()->count(5)->create();
        $this->actingAs(Company::factory()->create(), 'company');

        uploadCompanyImage(UploadedFile::fake()->image('first.jpg', 800, 600))->assertCreated();
    });

    it('returns 422 with a Japanese message when the file is not an image', function () {
        Storage::fake();
        $this->actingAs(Company::factory()->create(), 'company');

        uploadCompanyImage(UploadedFile::fake()->create('brochure.pdf', 100, 'application/pdf'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image' => '写真には、JPEG・PNG・WebPの画像を指定してください。']);
    });

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/company/images')
            ->assertUnauthorized();
    });
});

describe('destroy', function () {
    it('deletes the company\'s own photo and its file', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $this->actingAs($company, 'company');
        uploadCompanyImage(UploadedFile::fake()->image('office.jpg', 800, 600));
        $image = $company->images()->sole();

        $this->deleteJson("/api/company/images/{$image->id}")->assertNoContent();

        $this->assertModelMissing($image);
        Storage::assertMissing($image->path);
    });

    it('returns 403 without deleting another company\'s photo', function () {
        $image = CompanyImage::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->deleteJson("/api/company/images/{$image->id}")
            ->assertForbidden();

        $this->assertModelExists($image);
    });
});
