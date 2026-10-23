<?php

use App\Enums\LikeStatus;
use App\Models\Bookmark;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Support\Facades\DB;

describe('index', function () {
    it('lists bookmarks newest first, keeping closed postings', function () {
        $user = User::factory()->create();
        $older = Bookmark::factory()->for($user)->create(['created_at' => now()->subDay()]);
        $closed = Bookmark::factory()->for($user)->for(JobPosting::factory()->closed())->create(['created_at' => now()]);
        // 他の求職者のブックマークは含めない
        Bookmark::factory()->create();

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/bookmarks')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $closed->id)
            ->assertJsonPath('data.0.job_posting_status.value', 'closed')
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonPath('data.1.job_posting.id', $older->job_posting_id);
    });

    it('adds the latest like on each posting for the status badge', function () {
        $user = User::factory()->create();
        $liked = Bookmark::factory()->for($user)->create();
        $notLiked = Bookmark::factory()->for($user)->create();
        // 期限切れのあとに再度いいねした場合は、新しい方の状態を出す
        Like::factory()->expired()->for($user)->create(['job_posting_id' => $liked->job_posting_id, 'created_at' => now()->subDays(10)]);
        $latest = Like::factory()->matched()->for($user)->create(['job_posting_id' => $liked->job_posting_id, 'created_at' => now()->subDay()]);
        // 他の求職者のいいねは関係ない
        Like::factory()->create(['job_posting_id' => $notLiked->job_posting_id]);

        $response = $this->actingAs($user, 'web')->getJson('/api/seeker/bookmarks')->assertOk();

        $byBookmark = collect($response->json('data'))->keyBy('id');
        expect($byBookmark[$liked->id]['latest_like'])->toBe([
            'id' => $latest->id,
            'status' => ['value' => 'matched', 'label' => 'マッチ'],
        ])
            ->and($byBookmark[$notLiked->id]['latest_like'])->toBeNull();
    });

    it('runs the same number of queries regardless of how many bookmarks are returned', function () {
        $user = User::factory()->create();

        $countQueries = function () use ($user): int {
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->actingAs($user, 'web')->getJson('/api/seeker/bookmarks')->assertOk();
            $count = count(DB::getQueryLog());
            // 有効なままだと後のテストのSQLもすべて記録され続け、メモリを使い果たすため無効に戻す
            DB::disableQueryLog();
            DB::flushQueryLog();

            return $count;
        };

        Bookmark::factory()->for($user)->create();
        $withOne = $countQueries();

        Bookmark::factory()->count(3)->for($user)->create();
        $withFour = $countQueries();

        expect($withFour)->toBe($withOne);
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/seeker/bookmarks')->assertUnauthorized();
    });
});

describe('store and destroy', function () {
    it('bookmarks a posting and treats a second request as success', function () {
        $user = User::factory()->create();
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs($user, 'web')->putJson("/api/seeker/job-postings/{$jobPosting->id}/bookmark")->assertNoContent();
        $this->putJson("/api/seeker/job-postings/{$jobPosting->id}/bookmark")->assertNoContent();

        expect($user->bookmarks()->where('job_posting_id', $jobPosting->id)->count())->toBe(1);
    });

    it('cannot bookmark a closed posting and hides drafts', function () {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/seeker/job-postings/'.JobPosting::factory()->closed()->create()->id.'/bookmark')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['job_posting' => 'この求人は募集を終了しています。']);

        $this->putJson('/api/seeker/job-postings/'.JobPosting::factory()->create()->id.'/bookmark')
            ->assertNotFound();
    });

    it('removes only the seeker\'s own bookmark and treats a missing one as success', function () {
        $user = User::factory()->create();
        $bookmark = Bookmark::factory()->for($user)->create();
        $othersBookmark = Bookmark::factory()->create(['job_posting_id' => $bookmark->job_posting_id]);

        $this->actingAs($user, 'web')->deleteJson("/api/seeker/job-postings/{$bookmark->job_posting_id}/bookmark")->assertNoContent();
        $this->deleteJson("/api/seeker/job-postings/{$bookmark->job_posting_id}/bookmark")->assertNoContent();

        expect(Bookmark::query()->whereKey($bookmark->id)->exists())->toBeFalse()
            ->and(Bookmark::query()->whereKey($othersBookmark->id)->exists())->toBeTrue();
    });

    it('returns 401 when logged in as a company', function () {
        $jobPosting = JobPosting::factory()->published()->create();

        $this->actingAs(Company::factory()->create(), 'company')
            ->putJson("/api/seeker/job-postings/{$jobPosting->id}/bookmark")
            ->assertUnauthorized();
    });
});

describe('my status', function () {
    it('tells whether the seeker bookmarked and liked the posting', function () {
        $user = User::factory()->create();
        $jobPosting = JobPosting::factory()->published()->create();
        Bookmark::factory()->for($user)->for($jobPosting)->create();
        $like = Like::factory()->for($user)->for($jobPosting)->create();

        $this->actingAs($user, 'web')
            ->getJson("/api/seeker/job-postings/{$jobPosting->id}/my-status")
            ->assertOk()
            ->assertExactJson(['data' => [
                'bookmarked' => true,
                'like' => ['id' => $like->id, 'status' => ['value' => 'applied', 'label' => 'いいね済']],
            ]]);
    });

    it('returns nothing for a posting the seeker has not touched', function () {
        $jobPosting = JobPosting::factory()->published()->create();
        // 他の求職者の操作は関係ない
        Bookmark::factory()->for($jobPosting)->create();
        Like::factory()->for($jobPosting)->create(['status' => LikeStatus::Matched]);

        $this->actingAs(User::factory()->create(), 'web')
            ->getJson("/api/seeker/job-postings/{$jobPosting->id}/my-status")
            ->assertOk()
            ->assertExactJson(['data' => ['bookmarked' => false, 'like' => null]]);
    });

    it('returns 404 for a draft posting', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->getJson('/api/seeker/job-postings/'.JobPosting::factory()->create()->id.'/my-status')
            ->assertNotFound();
    });
});
