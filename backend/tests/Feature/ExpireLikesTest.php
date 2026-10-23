<?php

use App\Enums\LikeStatus;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;

it('expires only likes waiting past their deadline', function () {
    $overdue = Like::factory()->create(['response_deadline' => now()->subMinute()]);
    $notYet = Like::factory()->create(['response_deadline' => now()->addMinute()]);
    // 返事済みのものは、期限を過ぎていても変えない
    $matched = Like::factory()->matched()->create(['response_deadline' => now()->subDay()]);
    $declined = Like::factory()->declined()->create(['response_deadline' => now()->subDay()]);

    $this->artisan('likes:expire')
        ->expectsOutput('1件のいいねを期限切れにしました。')
        ->assertSuccessful();

    expect($overdue->fresh()->status)->toBe(LikeStatus::Expired)
        ->and($notYet->fresh()->status)->toBe(LikeStatus::Applied)
        ->and($matched->fresh()->status)->toBe(LikeStatus::Matched)
        ->and($declined->fresh()->status)->toBe(LikeStatus::Declined);
});

it('lets the seeker like the same posting again after it expires', function () {
    $user = User::factory()->create();
    $jobPosting = JobPosting::factory()->published()->create();
    Like::factory()->for($user)->for($jobPosting)->create(['response_deadline' => now()->subMinute()]);

    $this->artisan('likes:expire')->assertSuccessful();

    $this->actingAs($user, 'web')
        ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", [
            'like_type' => 'standard',
            'motivation' => 'もう一度応募させてください。',
        ])
        ->assertCreated();
});

it('is scheduled every hour', function () {
    $event = collect(app(Schedule::class)->events())
        ->first(fn ($event) => str_contains($event->command, 'likes:expire'));

    expect($event)->not->toBeNull()
        ->and($event->expression)->toBe('0 * * * *');
});
