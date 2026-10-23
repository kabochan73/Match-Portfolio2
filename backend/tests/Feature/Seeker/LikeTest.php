<?php

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * いいねのリクエスト本文(テストごとに一部だけ上書きする)
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validLike(array $overrides = []): array
{
    return [
        'like_type' => 'standard',
        'motivation' => '貴社の自社SaaSの開発に携わりたいと考え、応募しました。',
        ...$overrides,
    ];
}

describe('store', function () {
    it('creates a like with a 7-day response deadline', function () {
        // DBのtimestampは秒単位で保存されるため、秒単位の時刻に固定して比べる
        $this->travelTo('2026-10-23 10:00:00');
        $user = User::factory()->create();
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs($user, 'web')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike(['like_type' => 'super']))
            ->assertCreated()
            ->assertJsonPath('data.like_type.value', 'super')
            ->assertJsonPath('data.status.value', 'applied');

        $like = Like::query()->sole();
        expect($like)
            ->user_id->toBe($user->id)
            ->job_posting_id->toBe($jobPosting->id)
            ->like_type->toBe(LikeType::Super)
            ->status->toBe(LikeStatus::Applied)
            ->response_deadline->toDateTimeString()->toBe('2026-10-30 10:00:00');
    });

    it('returns 422 when the posting is closed', function () {
        $jobPosting = JobPosting::factory()->closed()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['job_posting' => 'この求人は募集を終了しています。']);
    });

    it('returns 404 for a draft posting', function () {
        $jobPosting = JobPosting::factory()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike())
            ->assertNotFound();
    });

    it('rejects a second like on the same posting unless the first one expired', function (LikeStatus $status, bool $allowed) {
        $user = User::factory()->create();
        $jobPosting = JobPosting::factory()->published()->create();
        Like::factory()->for($user)->for($jobPosting)->create(['status' => $status]);

        $response = $this->actingAs($user, 'web')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike());

        if ($allowed) {
            $response->assertCreated();
        } else {
            $response->assertUnprocessable()
                ->assertJsonValidationErrors(['job_posting' => 'この求人にはすでにいいねしています。']);
        }
    })->with([
        'waiting for the company' => [LikeStatus::Applied, false],
        'matched' => [LikeStatus::Matched, false],
        'declined' => [LikeStatus::Declined, false],
        'expired' => [LikeStatus::Expired, true],
    ]);

    it('allows 5 standard likes and 1 super like per month', function () {
        $this->travelTo('2026-10-23 10:00:00');
        $user = User::factory()->create();
        Like::factory()->count(5)->for($user)->create(['created_at' => now()->subDays(3)]);

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/job-postings/'.JobPosting::factory()->published()->create()->id.'/likes', validLike())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['like_type' => '今月のいいねは上限(5回)に達しています。']);

        // スーパーいいねは通常とは別枠
        $this->postJson('/api/seeker/job-postings/'.JobPosting::factory()->published()->create()->id.'/likes', validLike(['like_type' => 'super']))
            ->assertCreated();

        $this->postJson('/api/seeker/job-postings/'.JobPosting::factory()->published()->create()->id.'/likes', validLike(['like_type' => 'super']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['like_type' => '今月のスーパーいいねは上限(1回)に達しています。']);
    });

    it('counts expired likes toward the monthly limit', function () {
        $this->travelTo('2026-10-23 10:00:00');
        $user = User::factory()->create();
        Like::factory()->count(5)->expired()->for($user)->create(['created_at' => now()->subDays(1)]);

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/job-postings/'.JobPosting::factory()->published()->create()->id.'/likes', validLike())
            ->assertUnprocessable();
    });

    it('resets the limit at midnight on the 1st in Japan time', function () {
        // 2026-11-01 00:30(日本時間) = 2026-10-31 15:30(UTC)
        $this->travelTo('2026-10-31 15:30:00');
        $user = User::factory()->create();
        // 2026-10-31 23:00(日本時間)のいいねは先月分なので数えない
        Like::factory()->count(5)->for($user)->create(['created_at' => '2026-10-31 14:00:00']);

        $this->actingAs($user, 'web')
            ->postJson('/api/seeker/job-postings/'.JobPosting::factory()->published()->create()->id.'/likes', validLike())
            ->assertCreated();
    });

    it('returns 422 with Japanese messages for invalid input', function (array $input, string $field, string $message) {
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike($input))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field => $message]);
    })->with([
        'missing motivation' => [['motivation' => ''], 'motivation', '志望動機は必須項目です。'],
        'motivation too long' => [['motivation' => str_repeat('あ', 2001)], 'motivation', '志望動機の文字数は、2000文字以下である必要があります。'],
        'unknown like type' => [['like_type' => 'ultra'], 'like_type', '選択されたいいねの種類は無効です。'],
    ]);

    it('returns 401 when not logged in as a seeker', function () {
        $jobPosting = JobPosting::factory()->published()->create();

        $this->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike())->assertUnauthorized();

        $this->actingAs(Company::factory()->create(), 'company')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", validLike())
            ->assertUnauthorized();
    });
});

describe('quota', function () {
    it('returns how many likes are left this month and when they reset', function () {
        $this->travelTo('2026-10-23 10:00:00');
        $user = User::factory()->create();
        Like::factory()->count(2)->for($user)->create(['created_at' => now()->subDay()]);
        Like::factory()->super()->for($user)->create(['created_at' => now()->subDay()]);
        // 先月のいいねは数えない
        Like::factory()->for($user)->create(['created_at' => '2026-09-20 10:00:00']);

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/like-quota')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'standard' => ['limit' => 5, 'used' => 2, 'remaining' => 3],
                    'super' => ['limit' => 1, 'used' => 1, 'remaining' => 0],
                    // 日本時間の11月1日0時
                    'resets_at' => '2026-10-31T15:00:00.000000Z',
                ],
            ]);
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/seeker/like-quota')->assertUnauthorized();
    });
});

describe('index', function () {
    it('lists likes for the selected tab with counts for every tab', function () {
        $user = User::factory()->create();
        $company = Company::factory()->create(['name' => '株式会社テスト']);
        $older = Like::factory()->for($user)->for(JobPosting::factory()->published()->for($company))->create(['created_at' => now()->subDays(2)]);
        $newer = Like::factory()->for($user)->create(['created_at' => now()->subDay()]);
        Like::factory()->matched()->for($user)->create();
        Like::factory()->declined()->for($user)->create();
        Like::factory()->expired()->for($user)->create();
        // 他の求職者のいいねは含めない
        Like::factory()->create();

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/likes')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            // 新しい順
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id)
            // 求人カードの情報も含める
            ->assertJsonPath('data.1.job_posting.company.name', '株式会社テスト')
            ->assertJsonPath('meta.counts', ['applied' => 2, 'matched' => 1, 'unsuccessful' => 2])
            // タブの件数を足しても、ページ分割の情報は残る
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.total', 2);
    });

    it('shows declined and expired likes together in the unsuccessful tab', function () {
        $user = User::factory()->create();
        Like::factory()->declined()->for($user)->create();
        Like::factory()->expired()->for($user)->create();
        Like::factory()->for($user)->create();

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/likes?status=unsuccessful')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.*.status.label', fn (array $labels) => collect($labels)->sort()->values()->all() === ['期限切れ', '見送り']);
    });

    it('returns 422 for an unknown tab', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->getJson('/api/seeker/likes?status=declined')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    });

    it('runs the same number of queries regardless of how many likes are returned', function () {
        $user = User::factory()->create();

        $countQueries = function () use ($user): int {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->actingAs($user, 'web')->getJson('/api/seeker/likes')->assertOk();
            $count = count(DB::getQueryLog());
            // 有効なままだと後のテストのSQLもすべて記録され続け、メモリを使い果たすため無効に戻す
            DB::disableQueryLog();
            DB::flushQueryLog();

            return $count;
        };

        Like::factory()->for($user)->create();
        $withOne = $countQueries();

        Like::factory()->count(3)->for($user)->create();
        $withFour = $countQueries();

        expect($withFour)->toBe($withOne);
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/seeker/likes')->assertUnauthorized();
    });
});

describe('show', function () {
    it('shows the seeker\'s own like with its posting', function () {
        $user = User::factory()->create();
        $like = Like::factory()->for($user)->create(['motivation' => 'ぜひ一緒に働きたいです。']);

        $this->actingAs($user, 'web')
            ->getJson("/api/seeker/likes/{$like->id}")
            ->assertOk()
            ->assertJsonPath('data.motivation', 'ぜひ一緒に働きたいです。')
            ->assertJsonPath('data.job_posting.id', $like->job_posting_id);
    });

    it('returns 403 for another seeker\'s like', function () {
        $like = Like::factory()->create();

        $this->actingAs(User::factory()->create(), 'web')
            ->getJson("/api/seeker/likes/{$like->id}")
            ->assertForbidden();
    });
});
