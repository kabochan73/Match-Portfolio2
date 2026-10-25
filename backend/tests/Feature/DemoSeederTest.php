<?php

use App\Enums\JobPostingStatus;
use App\Models\Company;
use App\Models\JobPosting;
use Database\Seeders\DemoCompanySeeder;
use Database\Seeders\DemoImages;
use Database\Seeders\MasterSeeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| デモ用のseeder
|--------------------------------------------------------------------------
|
| デモのデータは手書きのため、マスタにない名前(技術スタック・職種・働き方)の書き間違いや、
| 画面から登録できない値(求人の上限など)が混ざっていないかを確かめる
|
*/

beforeEach(function () {
    Storage::fake();
    // 画像を描くと時間がかかるため、テストでは空のファイルを置くだけにする
    $this->app->instance(DemoImages::class, new class extends DemoImages
    {
        public function logo(string $background, string $shape): string
        {
            return $this->fakeImage('avatars/companies');
        }

        public function photo(string $directory, string $background, string $shape, int $variant = 0): string
        {
            return $this->fakeImage($directory);
        }

        private function fakeImage(string $directory): string
        {
            $path = $directory.'/'.Str::random(10).'.webp';
            Storage::put($path, '');

            return $path;
        }
    });
    $this->seed(MasterSeeder::class);
});

describe('companies and job postings', function () {
    beforeEach(function () {
        $this->seed(DemoCompanySeeder::class);
        $this->data = require database_path('seeders/data/demo_companies.php');
    });

    it('creates every company with its tags and images, and the demo account can log in', function () {
        expect(Company::count())->toBe(count($this->data));

        foreach ($this->data as $data) {
            $company = Company::query()->where('email', $data['email'])->firstOrFail();

            // マスタにない名前があると、件数が足りなくなる
            expect($company->techStacks()->count())->toBe(count($data['tech_stacks']), "{$data['name']}の技術スタック")
                ->and($company->workStyles()->count())->toBe(count($data['work_styles']), "{$data['name']}の働き方")
                ->and($company->images()->count())->toBe(3)
                ->and(Storage::exists($company->avatar_path))->toBeTrue();
        }

        $this->postJson('/api/company/login', [
            'email' => DemoCompanySeeder::EMAIL,
            'password' => DemoCompanySeeder::PASSWORD,
        ])->assertOk();
    });

    it('does not let anyone log in to the other companies with the demo password', function () {
        $this->postJson('/api/company/login', [
            'email' => $this->data[1]['email'],
            'password' => DemoCompanySeeder::PASSWORD,
        ])->assertUnprocessable();
    });

    it('creates every job posting within the limits the forms allow', function () {
        $jobData = collect($this->data)->flatMap(fn (array $company) => $company['job_postings']);

        expect(JobPosting::count())->toBe($jobData->count());

        foreach ($jobData as $data) {
            $jobPosting = JobPosting::query()->where('title', $data['title'])->firstOrFail();

            expect($jobPosting->jobCategories()->count())->toBe(count($data['categories']), "{$data['title']}の職種")
                ->toBeBetween(1, 3)
                ->and($jobPosting->techStacks()->count())->toBe(count($data['tech_stacks']), "{$data['title']}の技術スタック")
                ->toBeLessThanOrEqual(5)
                ->and($jobPosting->salary)->toBeBetween(100000, 2000000)
                ->and($jobPosting->images()->count())->toBe(1);
        }

        // 1社が同時に公開できる求人は10件まで
        Company::all()->each(fn (Company $company) => expect(
            $company->jobPostings()->where('status', JobPostingStatus::Published)->count(),
        )->toBeLessThanOrEqual(JobPosting::MAX_PUBLISHED_PER_COMPANY));
    });

    it('gives the demo company a posting in every status', function () {
        $statuses = Company::query()->where('email', DemoCompanySeeder::EMAIL)->firstOrFail()
            ->jobPostings()->pluck('status');

        expect($statuses)->toContain(JobPostingStatus::Published, JobPostingStatus::Draft, JobPostingStatus::Closed);
    });

    it('does nothing when run again', function () {
        $this->seed(DemoCompanySeeder::class);

        expect(Company::count())->toBe(count($this->data));
    });
});
