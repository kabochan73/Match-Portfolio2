<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

/**
 * 求人に画像をアップロードする(multipartのため、postJsonではなくpostでAcceptを付けて送る)
 */
function uploadJobPostingImage(JobPosting $jobPosting, UploadedFile $file): TestResponse
{
    return test()->post("/api/company/job-postings/{$jobPosting->id}/images", ['image' => $file], ['Accept' => 'application/json']);
}

describe('store', function () {
    it('adds an image scaled down to fit within 1600x1200', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        $this->actingAs($company, 'company');

        $response = uploadJobPostingImage($jobPosting, UploadedFile::fake()->image('cover.jpg', 2400, 1200));

        $image = $jobPosting->images()->sole();
        $response->assertCreated()->assertJsonPath('data.url', Storage::url($image->path));
        expect($image->path)->toStartWith('job-posting-images/');
        expect(getimagesizefromstring(Storage::get($image->path)))->toMatchArray([0 => 1600, 1 => 800]);
    });

    it('returns 422 without saving a file when the posting already has 5 images', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->for($company)->create();
        JobPostingImage::factory()->count(5)->for($jobPosting)->create();
        $this->actingAs($company, 'company');

        uploadJobPostingImage($jobPosting, UploadedFile::fake()->image('sixth.jpg', 800, 600))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image' => '求人の画像は5枚までです。']);

        expect(Storage::allFiles())->toBe([]);
    });

    it('calls the field 画像 in the error message', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->for($company)->create();
        $this->actingAs($company, 'company');

        uploadJobPostingImage($jobPosting, UploadedFile::fake()->create('spec.pdf', 100, 'application/pdf'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['image' => '画像には、JPEG・PNG・WebPの画像を指定してください。']);
    });

    it('returns 403 for another company\'s posting', function () {
        Storage::fake();
        $jobPosting = JobPosting::factory()->create();
        $this->actingAs(Company::factory()->create(), 'company');

        uploadJobPostingImage($jobPosting, UploadedFile::fake()->image('cover.jpg', 800, 600))
            ->assertForbidden();

        expect($jobPosting->images()->count())->toBe(0);
    });
});

describe('destroy', function () {
    it('deletes the image and its file', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->for($company)->create();
        $this->actingAs($company, 'company');
        uploadJobPostingImage($jobPosting, UploadedFile::fake()->image('cover.jpg', 800, 600));
        $image = $jobPosting->images()->sole();

        $this->deleteJson("/api/company/job-postings/{$jobPosting->id}/images/{$image->id}")
            ->assertNoContent();

        $this->assertModelMissing($image);
        Storage::assertMissing($image->path);
    });

    it('returns 404 when the image belongs to a different posting in the URL', function () {
        $company = Company::factory()->create();
        $ownPosting = JobPosting::factory()->for($company)->create();
        $otherImage = JobPostingImage::factory()->create();

        $this->actingAs($company, 'company')
            ->deleteJson("/api/company/job-postings/{$ownPosting->id}/images/{$otherImage->id}")
            ->assertNotFound();

        $this->assertModelExists($otherImage);
    });

    it('returns 403 for another company\'s posting', function () {
        $image = JobPostingImage::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->deleteJson("/api/company/job-postings/{$image->job_posting_id}/images/{$image->id}")
            ->assertForbidden();

        $this->assertModelExists($image);
    });
});
