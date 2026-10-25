<?php

use App\Models\Company;
use App\Models\CompanyImage;
use App\Models\JobCategory;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Models\User;
use App\Services\NextRevalidator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;

/*
|--------------------------------------------------------------------------
| 公開ページのデータが変わる操作で、Next.jsへの再検証の通知を頼んでいるか
|--------------------------------------------------------------------------
|
| 通知の中身(送るタグ)はNextRevalidatorTestで確かめるため、ここでは呼び出しだけを確かめる
|
*/

beforeEach(function () {
    Storage::fake();
    $this->revalidator = $this->spy(NextRevalidator::class);
});

/**
 * 求人が変わったことを1回通知したか
 */
function expectJobPostingRevalidated(MockInterface $revalidator, JobPosting $jobPosting, bool $listChanged): void
{
    $revalidator->shouldHaveReceived('jobPostingChanged')
        ->withArgs(fn (JobPosting $changed, bool $list = false) => $changed->is($jobPosting) && $list === $listChanged)
        ->once();
}

describe('job postings', function () {
    it('revalidates the posting when it is updated', function () {
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs($jobPosting->company, 'company')
            ->putJson("/api/company/job-postings/{$jobPosting->id}", [
                'title' => '更新した求人',
                'description' => '仕事内容',
                'desired_candidate' => '求める人材',
                'employment_type' => 'full_time',
                'prefecture' => 'tokyo',
                'salary' => 400000,
                'selection_steps' => ['面接'],
                'job_category_ids' => [JobCategory::factory()->create()->id],
                'tech_stack_ids' => [],
            ])
            ->assertOk();

        expectJobPostingRevalidated($this->revalidator, $jobPosting, listChanged: false);
    });

    it('revalidates the posting and the job list when it is published, closed, or deleted', function (string $method, Closure $path, Closure $posting) {
        $jobPosting = $posting();

        $this->actingAs($jobPosting->company, 'company')
            ->json($method, $path($jobPosting))
            ->assertSuccessful();

        expectJobPostingRevalidated($this->revalidator, $jobPosting, listChanged: true);
    })->with([
        'publish' => ['POST', fn (JobPosting $jobPosting) => "/api/company/job-postings/{$jobPosting->id}/publish", fn () => JobPosting::factory()->create()],
        'close' => ['POST', fn (JobPosting $jobPosting) => "/api/company/job-postings/{$jobPosting->id}/close", fn () => JobPosting::factory()->published()->create()],
        'delete' => ['DELETE', fn (JobPosting $jobPosting) => "/api/company/job-postings/{$jobPosting->id}", fn () => JobPosting::factory()->published()->create()],
    ]);

    it('revalidates the posting when an image is added or removed', function () {
        $jobPosting = JobPosting::factory()->published()->create();
        $image = JobPostingImage::factory()->for($jobPosting)->create();

        $this->actingAs($jobPosting->company, 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/images", [
                'image' => UploadedFile::fake()->image('office.jpg'),
            ])
            ->assertCreated();
        $this->deleteJson("/api/company/job-postings/{$jobPosting->id}/images/{$image->id}")
            ->assertNoContent();

        $this->revalidator->shouldHaveReceived('jobPostingChanged')->twice();
    });

    it('does not revalidate when the change is rejected', function () {
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/close")
            ->assertForbidden();

        $this->revalidator->shouldNotHaveReceived('jobPostingChanged');
    });
});

describe('company page', function () {
    it('revalidates the company when the profile is updated', function () {
        $company = Company::factory()->create();

        $this->actingAs($company, 'company')
            ->putJson('/api/company/profile', [
                'name' => '更新した会社',
                'tech_stack_ids' => [],
                'work_style_ids' => [],
            ])
            ->assertOk();

        $this->revalidator->shouldHaveReceived('companyChanged')
            ->withArgs(fn (Company $changed) => $changed->is($company))
            ->once();
    });

    it('revalidates the company when the logo or a gallery photo changes', function () {
        $company = Company::factory()->create();
        $photo = CompanyImage::factory()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson('/api/company/avatar', ['avatar' => UploadedFile::fake()->image('logo.png')])
            ->assertOk();
        $this->deleteJson('/api/company/avatar')->assertOk();
        $this->postJson('/api/company/images', ['image' => UploadedFile::fake()->image('office.jpg')])
            ->assertCreated();
        $this->deleteJson("/api/company/images/{$photo->id}")->assertNoContent();

        $this->revalidator->shouldHaveReceived('companyChanged')
            ->withArgs(fn (Company $changed) => $changed->is($company))
            ->times(4);
    });
});

it('revalidates the posting when a seeker likes it', function () {
    $jobPosting = JobPosting::factory()->published()->create();

    $this->actingAs(User::factory()->create(), 'web')
        ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", [
            'like_type' => 'standard',
            'motivation' => 'ぜひ応募させてください。',
        ])
        ->assertCreated();

    expectJobPostingRevalidated($this->revalidator, $jobPosting, listChanged: false);
});
