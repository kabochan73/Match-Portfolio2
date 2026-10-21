<?php

use App\Enums\EmploymentType;
use App\Enums\Prefecture;
use App\Models\Company;
use App\Models\JobCategory;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Models\Like;
use App\Models\TechStack;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * 検索結果の求人IDを、返ってきた順に取り出す
 *
 * @param  array<string, mixed>  $query
 * @return list<int>
 */
function searchJobIds(array $query = []): array
{
    return collect(test()->getJson('/api/jobs?'.http_build_query($query))->assertOk()->json('data'))
        ->pluck('id')
        ->all();
}

it('returns only published postings with the fields for a job card', function () {
    Storage::fake();
    $company = Company::factory()->create(['name' => '株式会社テックマッチ']);
    $published = JobPosting::factory()->published()->for($company)->create(['salary' => 400000]);
    JobPosting::factory()->for($company)->create();
    JobPosting::factory()->closed()->for($company)->create();
    JobPostingImage::factory()->for($published)->create(['path' => 'job-posting-images/first.webp']);
    JobPostingImage::factory()->for($published)->create(['path' => 'job-posting-images/second.webp']);
    Like::factory()->count(2)->for($published)->create();

    $this->getJson('/api/jobs')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $published->id)
        ->assertJsonPath('data.0.company.name', '株式会社テックマッチ')
        ->assertJsonPath('data.0.salary', 400000)
        ->assertJsonPath('data.0.likes_count', 2)
        ->assertJsonPath('data.0.cover_image_url', Storage::url('job-posting-images/first.webp'))
        ->assertJsonMissingPath('data.0.description')
        ->assertJsonMissingPath('data.0.company.email');
});

it('returns null for the cover image when the posting has no images', function () {
    JobPosting::factory()->published()->create();

    $this->getJson('/api/jobs')->assertJsonPath('data.0.cover_image_url', null);
});

it('marks postings first published within 30 days as new', function () {
    $this->travelTo('2026-10-21 12:00:00');
    $new = JobPosting::factory()->published()->create(['published_at' => '2026-09-21 12:00:00']);
    $old = JobPosting::factory()->published()->create(['published_at' => '2026-09-21 11:59:59']);

    $data = collect($this->getJson('/api/jobs')->json('data'))->keyBy('id');

    expect($data[$new->id]['is_new'])->toBeTrue()
        ->and($data[$old->id]['is_new'])->toBeFalse();
});

describe('filters', function () {
    it('returns only postings that use every selected tech stack', function () {
        [$php, $laravel] = TechStack::factory()->count(2)->create();
        $both = JobPosting::factory()->published()->create();
        $both->techStacks()->attach([$php->id, $laravel->id]);
        $phpOnly = JobPosting::factory()->published()->create();
        $phpOnly->techStacks()->attach($php->id);

        expect(searchJobIds(['tech_stack_ids' => [$php->id, $laravel->id]]))->toBe([$both->id]);
    });

    it('returns only postings that have every selected job category', function () {
        [$backend, $sre] = JobCategory::factory()->count(2)->create();
        $both = JobPosting::factory()->published()->create();
        $both->jobCategories()->attach([$backend->id, $sre->id]);
        $backendOnly = JobPosting::factory()->published()->create();
        $backendOnly->jobCategories()->attach($backend->id);

        expect(searchJobIds(['job_category_ids' => [$backend->id, $sre->id]]))->toBe([$both->id]);
    });

    it('filters by location including remote', function () {
        $remote = JobPosting::factory()->published()->create(['prefecture' => Prefecture::Remote]);
        JobPosting::factory()->published()->create(['prefecture' => Prefecture::Tokyo]);

        expect(searchJobIds(['prefecture' => 'remote']))->toBe([$remote->id]);
    });

    it('returns postings that match any of the selected employment types', function () {
        $fullTime = JobPosting::factory()->published()->create(['employment_type' => EmploymentType::FullTime, 'published_at' => now()->subDay()]);
        $freelance = JobPosting::factory()->published()->create(['employment_type' => EmploymentType::Freelance, 'published_at' => now()]);
        JobPosting::factory()->published()->create(['employment_type' => EmploymentType::PartTime]);

        expect(searchJobIds(['employment_types' => ['full_time', 'freelance']]))->toBe([$freelance->id, $fullTime->id]);
    });

    it('returns postings whose title or description contains every keyword, ignoring case', function () {
        $match = JobPosting::factory()->published()->create(['title' => 'Laravelエンジニア', 'description' => '自社開発のSaaSです']);
        JobPosting::factory()->published()->create(['title' => 'Laravelエンジニア', 'description' => '受託開発です']);

        // 全角スペースでも区切れる
        expect(searchJobIds(['keyword' => 'laravel　saas']))->toBe([$match->id]);
    });

    it('treats % in the keyword as a literal character', function () {
        $match = JobPosting::factory()->published()->create(['title' => '在宅率100%の求人']);
        JobPosting::factory()->published()->create(['title' => '在宅率1000の求人']);

        expect(searchJobIds(['keyword' => '100%']))->toBe([$match->id]);
    });

    it('combines different conditions with AND', function () {
        $php = TechStack::factory()->create();
        $match = JobPosting::factory()->published()->create(['prefecture' => Prefecture::Tokyo]);
        $match->techStacks()->attach($php->id);
        $osaka = JobPosting::factory()->published()->create(['prefecture' => Prefecture::Osaka]);
        $osaka->techStacks()->attach($php->id);

        expect(searchJobIds(['prefecture' => 'tokyo', 'tech_stack_ids' => [$php->id]]))->toBe([$match->id]);
    });

    it('returns 422 for an unknown location or sort', function () {
        $this->getJson('/api/jobs?prefecture=atlantis&sort=random')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['prefecture', 'sort']);
    });
});

describe('sorting', function () {
    it('sorts by first published time, newest first, by default', function () {
        $older = JobPosting::factory()->published()->create(['published_at' => now()->subDays(3)]);
        $newer = JobPosting::factory()->published()->create(['published_at' => now()->subDay()]);

        expect(searchJobIds())->toBe([$newer->id, $older->id]);
    });

    it('sorts by likes in the last 30 days when sorting by popularity', function () {
        $this->travelTo('2026-10-21 12:00:00');
        $recentlyLiked = JobPosting::factory()->published()->create(['published_at' => now()->subDays(40)]);
        Like::factory()->count(2)->for($recentlyLiked)->create(['created_at' => now()->subDays(5)]);
        $likedLongAgo = JobPosting::factory()->published()->create(['published_at' => now()->subDays(50)]);
        Like::factory()->count(5)->expired()->for($likedLongAgo)->create(['created_at' => now()->subDays(31)]);
        $noLikes = JobPosting::factory()->published()->create(['published_at' => now()->subDay()]);

        // いいねの少ない(0件)同士は新着順
        expect(searchJobIds(['sort' => 'popular']))->toBe([$recentlyLiked->id, $noLikes->id, $likedLongAgo->id]);
    });
});

describe('pagination', function () {
    it('returns 24 postings per page with the total count', function () {
        JobPosting::factory()->count(25)->published()->create();

        $this->getJson('/api/jobs')
            ->assertOk()
            ->assertJsonCount(24, 'data')
            ->assertJsonPath('meta.total', 25)
            ->assertJsonPath('meta.last_page', 2);

        $this->getJson('/api/jobs?page=2')->assertJsonCount(1, 'data');
    });

    it('runs the same number of queries regardless of how many postings are returned', function () {
        $countQueries = function (): int {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->getJson('/api/jobs')->assertOk();
            $count = count(DB::getQueryLog());
            // 有効なままだと後のテストのSQLもすべて記録され続け、メモリを使い果たすため無効に戻す
            DB::disableQueryLog();
            DB::flushQueryLog();

            return $count;
        };

        $createPosting = function (): void {
            $jobPosting = JobPosting::factory()->published()->create();
            $jobPosting->techStacks()->attach(TechStack::factory()->create()->id);
            $jobPosting->jobCategories()->attach(JobCategory::factory()->create()->id);
            JobPostingImage::factory()->for($jobPosting)->create();
        };

        $createPosting();
        $queriesForOne = $countQueries();

        foreach (range(1, 9) as $i) {
            $createPosting();
        }

        expect($countQueries())->toBe($queriesForOne);
    });
});
