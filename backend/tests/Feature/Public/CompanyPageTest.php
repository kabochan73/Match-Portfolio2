<?php

use App\Models\Company;
use App\Models\CompanyImage;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Models\Like;
use App\Models\TechStack;
use App\Models\WorkStyle;
use Illuminate\Support\Facades\DB;

it('returns the company page with tags, gallery, and only published postings newest first', function () {
    $company = Company::factory()->withProfile()->create(['email' => 'hr@example.com']);
    $company->techStacks()->attach([
        TechStack::factory()->create(['name' => 'Laravel', 'sort_order' => 2])->id,
        TechStack::factory()->create(['name' => 'PHP', 'sort_order' => 1])->id,
    ]);
    $company->workStyles()->attach(WorkStyle::factory()->create(['name' => 'フルリモート'])->id);
    CompanyImage::factory()->count(2)->for($company)->create();
    $older = JobPosting::factory()->published()->for($company)->create(['published_at' => now()->subDays(5)]);
    $newer = JobPosting::factory()->published()->for($company)->create(['published_at' => now()->subDay()]);
    JobPosting::factory()->for($company)->create();
    JobPosting::factory()->closed()->for($company)->create();
    Like::factory()->for($newer)->create();

    $this->getJson("/api/companies/{$company->id}")
        ->assertOk()
        ->assertJsonPath('data.business_description', $company->business_description)
        ->assertJsonPath('data.tech_stacks.0.name', 'PHP')
        ->assertJsonPath('data.work_styles.0.name', 'フルリモート')
        ->assertJsonCount(2, 'data.images')
        ->assertJsonCount(2, 'data.job_postings')
        ->assertJsonPath('data.job_postings.0.id', $newer->id)
        ->assertJsonPath('data.job_postings.0.likes_count', 1)
        ->assertJsonPath('data.job_postings.1.id', $older->id)
        ->assertJsonMissingPath('data.job_postings.0.description')
        ->assertJsonMissingPath('data.email');
});

it('shows a company right after registration with empty fields and lists', function () {
    $company = Company::factory()->create();

    $this->getJson("/api/companies/{$company->id}")
        ->assertOk()
        ->assertJsonPath('data.introduction', null)
        ->assertJsonPath('data.prefecture', null)
        ->assertJsonCount(0, 'data.tech_stacks')
        ->assertJsonCount(0, 'data.job_postings');
});

it('runs the same number of queries regardless of how many postings the company has', function () {
    $company = Company::factory()->create();
    $countQueries = function () use ($company): int {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson("/api/companies/{$company->id}")->assertOk();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();
        DB::flushQueryLog();

        return $count;
    };
    $createPosting = function () use ($company): void {
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        $jobPosting->techStacks()->attach(TechStack::factory()->create()->id);
        JobPostingImage::factory()->for($jobPosting)->create();
    };

    $createPosting();
    $queriesForOne = $countQueries();

    foreach (range(1, 5) as $i) {
        $createPosting();
    }

    expect($countQueries())->toBe($queriesForOne);
});

it('returns 404 when the company does not exist', function () {
    $this->getJson('/api/companies/999999')->assertNotFound();
});
