<?php

use App\Enums\Prefecture;
use App\Models\Company;
use App\Models\JobCategory;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Models\Like;
use App\Models\TechStack;
use Illuminate\Support\Facades\Storage;

it('returns a published posting with its details and public company information', function () {
    Storage::fake();
    $company = Company::factory()->withProfile()->create([
        'name' => '株式会社テックマッチ',
        'email' => 'hr@example.com',
        'prefecture' => Prefecture::Tokyo,
    ]);
    $jobPosting = JobPosting::factory()->published()->for($company)->create([
        'description' => '自社サービスのAPI開発',
        'selection_steps' => ['カジュアル面談', '最終面接'],
    ]);
    $jobPosting->jobCategories()->attach(JobCategory::factory()->create(['name' => 'バックエンド'])->id);
    $jobPosting->techStacks()->attach(TechStack::factory()->create(['name' => 'Laravel'])->id);
    JobPostingImage::factory()->count(2)->for($jobPosting)->create();
    Like::factory()->for($jobPosting)->create();

    $this->getJson("/api/jobs/{$jobPosting->id}")
        ->assertOk()
        ->assertJsonPath('data.description', '自社サービスのAPI開発')
        ->assertJsonPath('data.selection_steps', ['カジュアル面談', '最終面接'])
        ->assertJsonPath('data.job_categories.0.name', 'バックエンド')
        ->assertJsonPath('data.tech_stacks.0.name', 'Laravel')
        ->assertJsonCount(2, 'data.images')
        ->assertJsonPath('data.likes_count', 1)
        ->assertJsonPath('data.company.name', '株式会社テックマッチ')
        ->assertJsonPath('data.company.prefecture.label', '東京')
        ->assertJsonMissingPath('data.company.email')
        ->assertJsonMissingPath('data.pending_likes_count');
});

it('returns a closed posting so that bookmarks and applications can still open it', function () {
    $jobPosting = JobPosting::factory()->closed()->create();

    $this->getJson("/api/jobs/{$jobPosting->id}")
        ->assertOk()
        ->assertJsonPath('data.status', ['value' => 'closed', 'label' => '募集終了']);
});

it('returns 404 for a draft so that unpublished postings are not revealed', function () {
    $jobPosting = JobPosting::factory()->create();

    $this->getJson("/api/jobs/{$jobPosting->id}")->assertNotFound();
});

it('returns 404 when the posting does not exist', function () {
    $this->getJson('/api/jobs/999999')->assertNotFound();
});
