<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Services\NextRevalidator;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    config([
        'services.frontend.revalidate_url' => 'http://frontend.test/internal/revalidate',
        'services.frontend.revalidate_secret' => 'secret',
    ]);
    // レスポンスのあとに送る通知を、テストではその場で実行する
    $this->withoutDefer();
});

it('sends the job posting and company tags with the secret', function () {
    Http::fake();
    $jobPosting = JobPosting::factory()->create();

    app(NextRevalidator::class)->jobPostingChanged($jobPosting);

    Http::assertSent(fn (Request $request) => $request->url() === 'http://frontend.test/internal/revalidate'
        && $request->hasHeader('X-Revalidate-Secret', 'secret')
        && $request['tags'] === ["job-{$jobPosting->id}", "company-{$jobPosting->company_id}"]);
});

it('also sends the job list tag when the posting enters or leaves the list', function () {
    Http::fake();
    $jobPosting = JobPosting::factory()->create();

    app(NextRevalidator::class)->jobPostingChanged($jobPosting, listChanged: true);

    Http::assertSent(fn (Request $request) => $request['tags'] === ["job-{$jobPosting->id}", "company-{$jobPosting->company_id}", 'jobs']);
});

it('sends the company tag when the company page changes', function () {
    Http::fake();
    $company = Company::factory()->create();

    app(NextRevalidator::class)->companyChanged($company);

    Http::assertSent(fn (Request $request) => $request['tags'] === ["company-{$company->id}"]);
});

it('sends nothing when the URL is not configured', function () {
    Http::fake();
    config(['services.frontend.revalidate_url' => null]);

    app(NextRevalidator::class)->companyChanged(Company::factory()->create());

    Http::assertNothingSent();
});

it('only logs a warning when Next.js fails to respond', function () {
    Http::fake(['*' => Http::response(status: 500)]);
    Log::spy();

    app(NextRevalidator::class)->companyChanged(Company::factory()->create());

    Log::shouldHaveReceived('warning')->once();
});
