<?php

use App\Enums\JobPostingStatus;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;

describe('publish', function () {
    it('publishes a draft and records the first published time', function () {
        // DBのtimestampは秒単位で保存されるため、秒単位の時刻に固定して比べる
        $this->travelTo('2026-10-21 09:00:00');
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/publish")
            ->assertOk()
            ->assertJsonPath('data.status.value', 'published');

        expect($jobPosting->fresh())
            ->status->toBe(JobPostingStatus::Published)
            ->published_at->toDateTimeString()->toBe('2026-10-21 09:00:00');
    });

    it('reopens a closed posting without changing the first published time', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->closed()->for($company)->create(['published_at' => '2026-08-01 10:00:00']);

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/publish")
            ->assertOk();

        expect($jobPosting->fresh())
            ->status->toBe(JobPostingStatus::Published)
            ->published_at->toDateTimeString()->toBe('2026-08-01 10:00:00');
    });

    it('returns 422 when the company already has 10 published postings', function () {
        $company = Company::factory()->create();
        JobPosting::factory()->count(10)->published()->for($company)->create();
        $draft = JobPosting::factory()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$draft->id}/publish")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => '公開中の求人が上限(10件)に達しています。他の求人を募集終了にしてから公開してください。']);

        expect($draft->fresh()->status)->toBe(JobPostingStatus::Draft);
    });

    it('allows the 10th published posting', function () {
        $company = Company::factory()->create();
        JobPosting::factory()->count(9)->published()->for($company)->create();
        $draft = JobPosting::factory()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$draft->id}/publish")
            ->assertOk();
    });

    it('does not count drafts, closed postings, or other companies toward the limit', function () {
        $company = Company::factory()->create();
        JobPosting::factory()->count(9)->published()->for($company)->create();
        JobPosting::factory()->count(3)->closed()->for($company)->create();
        JobPosting::factory()->count(10)->published()->create();
        $draft = JobPosting::factory()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$draft->id}/publish")
            ->assertOk();
    });

    it('returns 422 when the posting is already published', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/publish")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => 'この求人はすでに公開中です。']);
    });

    it('returns 403 for another company\'s posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/publish")
            ->assertForbidden();

        expect($jobPosting->fresh()->status)->toBe(JobPostingStatus::Draft);
    });
});

describe('close', function () {
    it('closes a published posting and keeps the likes waiting for a response', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        $like = Like::factory()->for($jobPosting)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/close")
            ->assertOk()
            ->assertJsonPath('data.status.value', 'closed');

        $this->assertModelExists($like);
    });

    it('returns 422 when the posting is not published', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->for($company)->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/close")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => '公開中の求人だけ募集終了にできます。']);
    });

    it('returns 403 for another company\'s posting', function () {
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->postJson("/api/company/job-postings/{$jobPosting->id}/close")
            ->assertForbidden();
    });
});
