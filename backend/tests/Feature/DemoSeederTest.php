<?php

use App\Enums\JobPostingStatus;
use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Database\Seeders\DemoActivitySeeder;
use Database\Seeders\DemoCompanySeeder;
use Database\Seeders\DemoImages;
use Database\Seeders\DemoSeekerSeeder;
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

        public function seekerAvatar(string $background, string $shape): string
        {
            return $this->fakeImage('avatars/users');
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

describe('seekers', function () {
    beforeEach(function () {
        $this->seed(DemoSeekerSeeder::class);
        $this->data = require database_path('seeders/data/demo_seekers.php');
    });

    it('creates every seeker within the limits the forms allow', function () {
        expect(User::count())->toBe(count($this->data));

        foreach ($this->data as $data) {
            $user = User::query()->where('email', $data['email'])->firstOrFail();

            expect($user->age())->toBe($data['age'], "{$data['name']}の年齢")
                ->toBeBetween(18, 60)
                ->and(mb_strlen($user->comment))->toBeLessThanOrEqual(200)
                ->and($user->workExperiences()->count())->toBe(count($data['work_experiences']))
                ->and($user->educations()->count())->toBe(count($data['educations']))
                ->and($user->certifications()->count())->toBe(count($data['certifications']));

            // 職歴は未来の年月にならず、退社は入社より前にならない
            $user->workExperiences->each(fn ($work) => expect($work->started_on->lte(now()))->toBeTrue()
                ->and($work->ended_on === null || $work->ended_on->gte($work->started_on))->toBeTrue());
        }
    });

    it('fills every profile item of the demo seeker, who is the only one that can log in', function () {
        $seeker = User::query()->where('email', DemoSeekerSeeder::EMAIL)->firstOrFail();

        expect($seeker)
            ->comment->not->toBeNull()
            ->portfolio_url->not->toBeNull()
            ->avatar_path->not->toBeNull()
            ->and($seeker->workExperiences()->exists())->toBeTrue()
            ->and($seeker->educations()->exists())->toBeTrue()
            ->and($seeker->certifications()->exists())->toBeTrue();

        $this->postJson('/api/seeker/login', [
            'email' => DemoSeekerSeeder::EMAIL,
            'password' => DemoSeekerSeeder::PASSWORD,
        ])->assertOk();

        $this->postJson('/api/seeker/logout')->assertNoContent();

        $this->postJson('/api/seeker/login', [
            'email' => $this->data[1]['email'],
            'password' => DemoSeekerSeeder::PASSWORD,
        ])->assertUnprocessable();
    });
});

describe('likes, bookmarks, and notifications', function () {
    beforeEach(function () {
        $this->seed([DemoCompanySeeder::class, DemoSeekerSeeder::class, DemoActivitySeeder::class]);
        $this->demoSeeker = User::query()->where('email', DemoSeekerSeeder::EMAIL)->firstOrFail();
        $this->demoCompany = Company::query()->where('email', DemoCompanySeeder::EMAIL)->firstOrFail();
    });

    it('gives the demo seeker likes in every status and leaves likes to try this month', function () {
        expect($this->demoSeeker->likes()->pluck('status')->countBy(fn (LikeStatus $status) => $status->value)->all())
            ->toEqual(['applied' => 2, 'matched' => 1, 'declined' => 1, 'expired' => 1])
            ->and($this->demoSeeker->bookmarks()->count())->toBe(3);

        $this->actingAs($this->demoSeeker, 'web')
            ->getJson('/api/seeker/like-quota')
            ->assertOk()
            ->assertJsonPath('data.standard.remaining', 3)
            ->assertJsonPath('data.super.remaining', 1);
    });

    it('gives the demo company applicants in every tab, including one close to the deadline', function () {
        $this->actingAs($this->demoCompany, 'company')
            ->getJson('/api/company/likes')
            ->assertOk()
            ->assertJsonPath('meta.counts', ['applied' => 4, 'matched' => 2, 'unsuccessful' => 3]);

        $deadlines = Like::query()->whereIn('job_posting_id', $this->demoCompany->jobPostings()->pluck('id'))
            ->where('status', LikeStatus::Applied)->pluck('response_deadline');
        expect($deadlines->contains(fn ($deadline) => now()->diffInDays($deadline) <= 3))->toBeTrue();
    });

    it('creates likes the real rules would allow', function () {
        // 反応待ちは期限内、結果が出たものだけが返事の日時を持つ
        Like::all()->each(fn (Like $like) => expect($like->status === LikeStatus::Applied ? $like->response_deadline->isFuture() : true)->toBeTrue()
            ->and(in_array($like->status, [LikeStatus::Matched, LikeStatus::Declined], true) === ($like->responded_at !== null))->toBeTrue());

        // 同じ求人へのいいねは1人1件、今月のいいねは種類ごとの上限まで
        $since = Like::currentQuotaPeriodStart();
        User::all()->each(function (User $user) use ($since) {
            expect($user->likes()->pluck('job_posting_id')->duplicates())->toBeEmpty();

            foreach (LikeType::cases() as $likeType) {
                expect($user->likes()->where('like_type', $likeType)->where('created_at', '>=', $since)->count())
                    ->toBeLessThanOrEqual($likeType->monthlyLimit());
            }
        });

        // 下書きの求人にはいいねがない
        expect(Like::query()->whereHas('jobPosting', fn ($query) => $query->where('status', JobPostingStatus::Draft))->exists())->toBeFalse();
    });

    it('sends notifications to both demo accounts, mixing read and unread', function () {
        foreach ([$this->demoSeeker, $this->demoCompany] as $notifiable) {
            expect($notifiable->notifications()->count())->toBeGreaterThan(0)
                ->and($notifiable->unreadNotifications()->count())->toBeGreaterThan(0)
                ->and($notifiable->readNotifications()->count())->toBeGreaterThan(0);
        }
    });

    it('does nothing when run again', function () {
        $count = Like::count();

        $this->seed(DemoActivitySeeder::class);

        expect(Like::count())->toBe($count);
    });
});
