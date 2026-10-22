<?php

use App\Models\Bookmark;
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

/**
 * @return array<string, mixed>
 */
function validJobPosting(array $overrides = []): array
{
    return array_merge([
        'title' => 'Laravelで自社SaaSを作るバックエンドエンジニア',
        'description' => '自社サービスのAPI開発を担当していただきます。',
        'desired_candidate' => 'Laravelでの開発経験が2年以上ある方',
        'employment_type' => 'full_time',
        'prefecture' => 'remote',
        'salary' => 400000,
        'selection_steps' => ['カジュアル面談', '一次面接', '最終面接'],
        'job_category_ids' => [JobCategory::factory()->create()->id],
        'tech_stack_ids' => [],
    ], $overrides);
}

describe('store', function () {
    it('creates a posting as a draft with its categories and tech stacks', function () {
        $company = Company::factory()->create();
        $backend = JobCategory::factory()->create(['sort_order' => 1]);
        $sre = JobCategory::factory()->create(['sort_order' => 2]);
        $laravel = TechStack::factory()->create();

        $this->actingAs($company, 'company')
            ->postJson('/api/company/job-postings', validJobPosting([
                'job_category_ids' => [$sre->id, $backend->id],
                'tech_stack_ids' => [$laravel->id],
            ]))
            ->assertCreated()
            ->assertJsonPath('data.status.value', 'draft')
            ->assertJsonPath('data.published_at', null)
            ->assertJsonPath('data.prefecture', ['value' => 'remote', 'label' => 'リモート'])
            ->assertJsonPath('data.job_categories.0.id', $backend->id)
            ->assertJsonPath('data.job_categories.1.id', $sre->id)
            ->assertJsonPath('data.tech_stacks.0.id', $laravel->id);

        expect($company->jobPostings()->sole()->selection_steps)->toBe(['カジュアル面談', '一次面接', '最終面接']);
    });

    it('ignores a status sent in the request', function () {
        $company = Company::factory()->create();

        $this->actingAs($company, 'company')
            ->postJson('/api/company/job-postings', validJobPosting(['status' => 'published']))
            ->assertCreated()
            ->assertJsonPath('data.status.value', 'draft');
    });

    it('returns 422 with Japanese messages for invalid input', function (Closure $input, string $field, string $message) {
        $this->actingAs(Company::factory()->create(), 'company')
            ->postJson('/api/company/job-postings', validJobPosting($input()))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field => $message]);
    })->with([
        'salary too low' => [fn () => ['salary' => 99999], 'salary', '月給は10万円以上で指定してください。'],
        'salary too high' => [fn () => ['salary' => 2000001], 'salary', '月給は200万円以下で指定してください。'],
        'no category' => [fn () => ['job_category_ids' => []], 'job_category_ids', '職種は必須項目です。'],
        'four categories' => [fn () => ['job_category_ids' => JobCategory::factory()->count(4)->create()->pluck('id')->all()], 'job_category_ids', '職種は3つまで選べます。'],
        'six tech stacks' => [fn () => ['tech_stack_ids' => TechStack::factory()->count(6)->create()->pluck('id')->all()], 'tech_stack_ids', '技術スタックは5つまで選べます。'],
        'seven steps' => [fn () => ['selection_steps' => array_fill(0, 7, '面接')], 'selection_steps', '選考フローは6ステップまでです。'],
        'empty step name' => [fn () => ['selection_steps' => ['カジュアル面談', '']], 'selection_steps.1', '選考ステップは必須項目です。'],
        'unknown location' => [fn () => ['prefecture' => 'atlantis'], 'prefecture', '選択された勤務地は無効です。'],
        'missing title' => [fn () => ['title' => ''], 'title', '求人タイトルは必須項目です。'],
    ]);

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->postJson('/api/company/job-postings', validJobPosting())
            ->assertUnauthorized();
    });
});

describe('update', function () {
    it('updates a published posting and replaces its categories without changing its status', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        $jobPosting->jobCategories()->attach(JobCategory::factory()->create()->id);
        $newCategory = JobCategory::factory()->create();

        $this->actingAs($company, 'company')
            ->putJson("/api/company/job-postings/{$jobPosting->id}", validJobPosting([
                'title' => '新しいタイトル',
                'job_category_ids' => [$newCategory->id],
            ]))
            ->assertOk()
            ->assertJsonPath('data.title', '新しいタイトル')
            ->assertJsonPath('data.status.value', 'published')
            ->assertJsonCount(1, 'data.job_categories')
            ->assertJsonPath('data.job_categories.0.id', $newCategory->id);
    });

    it('returns 403 without changing another company\'s posting', function () {
        $jobPosting = JobPosting::factory()->create(['title' => '他社の求人']);

        $this->actingAs(Company::factory()->create(), 'company')
            ->putJson("/api/company/job-postings/{$jobPosting->id}", validJobPosting())
            ->assertForbidden();

        expect($jobPosting->fresh()->title)->toBe('他社の求人');
    });
});

describe('destroy', function () {
    it('deletes a posting without likes along with its tags, bookmarks, and image files', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        $jobPosting->jobCategories()->attach(JobCategory::factory()->create()->id);
        $image = JobPostingImage::factory()->for($jobPosting)->create(['path' => 'job-posting-images/cover.webp']);
        Storage::put('job-posting-images/cover.webp', 'image');
        $bookmark = Bookmark::factory()->for($jobPosting)->create();

        $this->actingAs($company, 'company')
            ->deleteJson("/api/company/job-postings/{$jobPosting->id}")
            ->assertNoContent();

        $this->assertModelMissing($jobPosting);
        $this->assertModelMissing($image);
        $this->assertModelMissing($bookmark);
        $this->assertDatabaseMissing('job_posting_job_category', ['job_posting_id' => $jobPosting->id]);
        Storage::assertMissing('job-posting-images/cover.webp');
    });

    it('returns 422 without deleting a posting that has likes', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->closed()->for($company)->create();
        Like::factory()->expired()->for($jobPosting)->create();

        $this->actingAs($company, 'company')
            ->deleteJson("/api/company/job-postings/{$jobPosting->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['job_posting' => 'いいねがある求人は削除できません。募集終了にしてください。']);

        $this->assertModelExists($jobPosting);
    });

    it('returns the same 422 instead of a server error when a like arrives right before deletion', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create();
        Storage::put('job-posting-images/cover.webp', 'image');
        JobPostingImage::factory()->for($jobPosting)->create(['path' => 'job-posting-images/cover.webp']);
        // いいねの有無を確認した後、実際に削除する直前にいいねが入った状況を再現する
        JobPosting::deleting(fn (JobPosting $deleting) => Like::factory()->for($deleting)->create());

        $this->actingAs($company, 'company')
            ->deleteJson("/api/company/job-postings/{$jobPosting->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['job_posting' => 'いいねがある求人は削除できません。募集終了にしてください。']);

        $this->assertModelExists($jobPosting);
        Storage::assertExists('job-posting-images/cover.webp');
    });

    it('returns 403 without deleting another company\'s posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->deleteJson("/api/company/job-postings/{$jobPosting->id}")
            ->assertForbidden();

        $this->assertModelExists($jobPosting);
    });
});

describe('show', function () {
    it('returns the posting with categories, tech stacks, images, and counts', function () {
        Storage::fake();
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create([
            'salary' => 450000,
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
            ->assertJsonPath('data.salary', 450000)
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
