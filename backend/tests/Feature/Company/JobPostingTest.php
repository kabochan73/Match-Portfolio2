<?php

use App\Models\Company;
use App\Models\JobCategory;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Models\Like;
use App\Models\TechStack;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

describe('index', function () {
    it('lists only the company\'s own postings, most recently updated first', function () {
        $company = Company::factory()->create();
        $older = JobPosting::factory()->for($company)->create(['updated_at' => now()->subDays(2)]);
        $newer = JobPosting::factory()->for($company)->create(['updated_at' => now()->subDay()]);
        JobPosting::factory()->create();

        $this->actingAs($company, 'company')
            ->getJson('/api/company/job-postings')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id);
    });

    it('includes the total like count and the count still waiting for a response', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        Like::factory()->for($jobPosting)->create();
        Like::factory()->matched()->for($jobPosting)->create();
        Like::factory()->declined()->for($jobPosting)->create();

        $this->actingAs($company, 'company')
            ->getJson('/api/company/job-postings')
            ->assertOk()
            ->assertJsonPath('data.0.likes_count', 3)
            ->assertJsonPath('data.0.pending_likes_count', 1);
    });

    it('returns the number of published postings and the limit in meta', function () {
        $company = Company::factory()->create();
        JobPosting::factory()->count(3)->published()->for($company)->create();
        JobPosting::factory()->for($company)->create();
        JobPosting::factory()->closed()->for($company)->create();

        $this->actingAs($company, 'company')
            ->getJson('/api/company/job-postings')
            ->assertOk()
            ->assertJsonPath('meta.published_count', 3)
            ->assertJsonPath('meta.max_published', 10);
    });

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->getJson('/api/company/job-postings')
            ->assertUnauthorized();
    });
});

describe('show', function () {
    it('returns the posting with categories, tech stacks, images, and counts', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create([
            'salary_min' => 400000,
            'salary_max' => 600000,
            'selection_steps' => ['カジュアル面談', '最終面接'],
        ]);
        $jobPosting->jobCategories()->attach(JobCategory::factory()->create(['name' => 'バックエンド'])->id);
        $jobPosting->techStacks()->attach(TechStack::factory()->create(['name' => 'Laravel'])->id);
        JobPostingImage::factory()->for($jobPosting)->create();
        Like::factory()->for($jobPosting)->create();

        $this->actingAs($company, 'company')
            ->getJson("/api/company/job-postings/{$jobPosting->id}")
            ->assertOk()
            ->assertJsonPath('data.status', ['value' => 'published', 'label' => '公開中'])
            ->assertJsonPath('data.salary_min', 400000)
            ->assertJsonPath('data.selection_steps', ['カジュアル面談', '最終面接'])
            ->assertJsonPath('data.job_categories.0.name', 'バックエンド')
            ->assertJsonPath('data.tech_stacks.0.name', 'Laravel')
            ->assertJsonCount(1, 'data.images')
            ->assertJsonPath('data.pending_likes_count', 1);
    });

    it('returns 403 for another company\'s posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->getJson("/api/company/job-postings/{$jobPosting->id}")
            ->assertForbidden();
    });

    it('returns 404 when the posting does not exist', function () {
        $this->actingAs(Company::factory()->create(), 'company')
            ->getJson('/api/company/job-postings/999999')
            ->assertNotFound();
    });
});
