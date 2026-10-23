<?php

use App\Enums\LikeStatus;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Support\Facades\DB;

/**
 * 指定した企業の求人へのいいね
 *
 * @param  array<string, mixed>  $attributes
 */
function receivedLike(Company $company, array $attributes = []): Like
{
    return Like::factory()
        ->for(JobPosting::factory()->published()->for($company))
        ->create($attributes);
}

describe('index', function () {
    it('lists only likes on the company\'s own postings, soonest deadline first', function () {
        $company = Company::factory()->create();
        $later = receivedLike($company, ['response_deadline' => now()->addDays(5)]);
        $sooner = receivedLike($company, ['response_deadline' => now()->addDay()]);
        receivedLike($company, ['status' => LikeStatus::Matched]);
        receivedLike($company, ['status' => LikeStatus::Expired]);
        // 他社の求人へのいいねは含めない
        Like::factory()->create();

        $this->actingAs($company, 'company')
            ->getJson('/api/company/likes')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $sooner->id)
            ->assertJsonPath('data.1.id', $later->id)
            ->assertJsonPath('meta.counts', ['applied' => 2, 'matched' => 1, 'unsuccessful' => 1]);
    });

    it('shows age instead of birth date and reveals the email only after a match', function () {
        $this->travelTo('2026-10-23 10:00:00');
        $company = Company::factory()->create();
        $user = User::factory()->create(['birth_date' => '1998-04-01', 'email' => 'seeker@example.com']);
        receivedLike($company, ['user_id' => $user->id]);

        $applied = $this->actingAs($company, 'company')->getJson('/api/company/likes')->assertOk();
        $applied->assertJsonPath('data.0.applicant.age', 28)
            ->assertJsonMissingPath('data.0.applicant.birth_date')
            ->assertJsonMissingPath('data.0.applicant.email');

        Like::query()->update(['status' => LikeStatus::Matched]);

        $this->getJson('/api/company/likes?status=matched')
            ->assertOk()
            ->assertJsonPath('data.0.applicant.email', 'seeker@example.com');
    });

    it('filters by one of the company\'s postings', function () {
        $company = Company::factory()->create();
        $target = receivedLike($company);
        receivedLike($company);

        $this->actingAs($company, 'company')
            ->getJson("/api/company/likes?job_posting_id={$target->job_posting_id}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $target->id)
            ->assertJsonPath('meta.counts.applied', 1);
    });

    it('returns 422 when filtering by another company\'s posting', function () {
        $otherPosting = JobPosting::factory()->published()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->getJson("/api/company/likes?job_posting_id={$otherPosting->id}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['job_posting_id' => '選択された求人は、有効ではありません。']);
    });

    it('runs the same number of queries regardless of how many likes are returned', function () {
        $company = Company::factory()->create();

        $countQueries = function () use ($company): int {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->actingAs($company, 'company')->getJson('/api/company/likes')->assertOk();
            $count = count(DB::getQueryLog());
            // 有効なままだと後のテストのSQLもすべて記録され続け、メモリを使い果たすため無効に戻す
            DB::disableQueryLog();
            DB::flushQueryLog();

            return $count;
        };

        receivedLike($company);
        $withOne = $countQueries();

        receivedLike($company);
        receivedLike($company);
        $withThree = $countQueries();

        expect($withThree)->toBe($withOne);
    });

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->getJson('/api/company/likes')
            ->assertUnauthorized();
    });
});

describe('show', function () {
    it('shows the applicant\'s full profile and motivation', function () {
        $company = Company::factory()->create();
        $like = receivedLike($company, ['motivation' => '貴社のSaaSに惹かれました。']);
        WorkExperience::factory()->for($like->user)->create(['company_name' => '前職株式会社']);

        $this->actingAs($company, 'company')
            ->getJson("/api/company/likes/{$like->id}")
            ->assertOk()
            ->assertJsonPath('data.motivation', '貴社のSaaSに惹かれました。')
            ->assertJsonPath('data.applicant.work_experiences.0.company_name', '前職株式会社')
            ->assertJsonPath('data.job_posting.id', $like->job_posting_id);
    });

    it('returns 403 for a like on another company\'s posting', function () {
        $like = Like::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->getJson("/api/company/likes/{$like->id}")
            ->assertForbidden();
    });
});

describe('respond', function () {
    it('matches an applicant and reveals the email', function () {
        $this->travelTo('2026-10-23 10:00:00');
        $company = Company::factory()->create();
        $like = receivedLike($company);

        $this->actingAs($company, 'company')
            ->postJson("/api/company/likes/{$like->id}/match")
            ->assertOk()
            ->assertJsonPath('data.status.value', 'matched')
            ->assertJsonPath('data.applicant.email', $like->user->email);

        expect($like->fresh())
            ->status->toBe(LikeStatus::Matched)
            ->responded_at->toDateTimeString()->toBe('2026-10-23 10:00:00');
    });

    it('declines an applicant without revealing the email', function () {
        $company = Company::factory()->create();
        $like = receivedLike($company);

        $this->actingAs($company, 'company')
            ->postJson("/api/company/likes/{$like->id}/decline")
            ->assertOk()
            ->assertJsonPath('data.status.value', 'declined')
            ->assertJsonMissingPath('data.applicant.email');

        expect($like->fresh()->status)->toBe(LikeStatus::Declined);
    });

    it('returns 422 when the like has already been answered', function (string $action) {
        $company = Company::factory()->create();
        $like = receivedLike($company, ['status' => LikeStatus::Declined]);

        $this->actingAs($company, 'company')
            ->postJson("/api/company/likes/{$like->id}/{$action}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => 'この応募にはすでに返事をしています。']);
    })->with(['match', 'decline']);

    it('returns 422 after the deadline even before the expiry batch runs', function () {
        $company = Company::factory()->create();
        // 状態はまだ反応待ちだが、期限は過ぎている
        $like = receivedLike($company, ['response_deadline' => now()->subMinute()]);

        $this->actingAs($company, 'company')
            ->postJson("/api/company/likes/{$like->id}/match")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status' => '返事の期限(7日)を過ぎています。']);

        expect($like->fresh()->status)->toBe(LikeStatus::Applied);
    });

    it('lets the company answer likes on a closed posting', function () {
        $company = Company::factory()->create();
        $like = Like::factory()->for(JobPosting::factory()->closed()->for($company))->create();

        $this->actingAs($company, 'company')
            ->postJson("/api/company/likes/{$like->id}/match")
            ->assertOk();
    });

    it('returns 403 for a like on another company\'s posting', function () {
        $like = Like::factory()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->postJson("/api/company/likes/{$like->id}/match")
            ->assertForbidden();

        expect($like->fresh()->status)->toBe(LikeStatus::Applied);
    });
});
