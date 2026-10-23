<?php

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;

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
