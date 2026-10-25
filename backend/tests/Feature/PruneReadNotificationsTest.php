<?php

use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

function createNotification(User $user, ?DateTimeInterface $readAt): DatabaseNotification
{
    return $user->notifications()->create([
        'id' => Str::uuid()->toString(),
        'type' => 'App\Notifications\LikeResultNotification',
        'data' => ['kind' => 'matched', 'like_id' => 1, 'message' => '通知'],
        'read_at' => $readAt,
    ]);
}

it('deletes only notifications read more than 90 days ago', function () {
    $user = User::factory()->create();
    $oldRead = createNotification($user, now()->subDays(91));
    $recentRead = createNotification($user, now()->subDays(89));
    // 未読は、どれだけ古くても本人がまだ見ていないため残す
    $unread = createNotification($user, null);
    $unread->forceFill(['created_at' => now()->subYear()])->save();

    $this->artisan('notifications:prune')
        ->expectsOutput('1件の通知を削除しました。')
        ->assertSuccessful();

    expect(DatabaseNotification::find($oldRead->id))->toBeNull()
        ->and(DatabaseNotification::find($recentRead->id))->not->toBeNull()
        ->and(DatabaseNotification::find($unread->id))->not->toBeNull();
});

it('is scheduled every day', function () {
    $event = collect(app(Schedule::class)->events())
        ->first(fn ($event) => str_contains($event->command, 'notifications:prune'));

    expect($event)->not->toBeNull()
        ->and($event->expression)->toBe('0 0 * * *');
});
