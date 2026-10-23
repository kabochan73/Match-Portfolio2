<?php

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use App\Notifications\LikeReceivedNotification;
use App\Notifications\LikeResultNotification;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

/**
 * 「株式会社テスト」の「バックエンドエンジニア」へのいいね
 *
 * @param  array<string, mixed>  $attributes
 */
function likeOnTestPosting(array $attributes = []): Like
{
    $company = Company::factory()->create(['name' => '株式会社テスト']);

    return Like::factory()
        ->for(JobPosting::factory()->published()->for($company)->state(['title' => 'バックエンドエンジニア']))
        ->create($attributes);
}

describe('sending', function () {
    it('tells the company about a new like', function () {
        $company = Company::factory()->create();
        $jobPosting = JobPosting::factory()->published()->for($company)->create(['title' => 'バックエンドエンジニア']);
        $user = User::factory()->create(['name' => '山田 太郎']);

        $this->actingAs($user, 'web')
            ->postJson("/api/seeker/job-postings/{$jobPosting->id}/likes", [
                'like_type' => 'super',
                'motivation' => '応募します。',
            ])
            ->assertCreated();

        $notification = $company->notifications()->sole();
        expect($notification->type)->toBe(LikeReceivedNotification::class)
            ->and($notification->data)->toBe([
                'kind' => 'received',
                'like_id' => Like::query()->sole()->id,
                'message' => '「バックエンドエンジニア」に山田 太郎さんからスーパーいいねが届きました。7日以内に返事をしてください。',
            ]);
    });

    it('tells the seeker the result when the company answers', function (string $action, string $message) {
        $like = likeOnTestPosting();

        $this->actingAs($like->jobPosting->company, 'company')
            ->postJson("/api/company/likes/{$like->id}/{$action}")
            ->assertOk();

        $notification = $like->user->notifications()->sole();
        expect($notification->type)->toBe(LikeResultNotification::class)
            ->and($notification->data['like_id'])->toBe($like->id)
            ->and($notification->data['message'])->toBe($message);
    })->with([
        'match' => ['match', '株式会社テストの「バックエンドエンジニア」とマッチしました。企業から登録メールアドレスに連絡が届きます。'],
        'decline' => ['decline', '株式会社テストの「バックエンドエンジニア」は、今回は見送りとなりました。'],
    ]);

    it('tells the seeker when the like expires', function () {
        $like = likeOnTestPosting(['response_deadline' => now()->subMinute()]);

        $this->artisan('likes:expire')->assertSuccessful();

        expect($like->user->notifications()->sole()->data)->toMatchArray([
            'kind' => 'expired',
            'message' => '株式会社テストの「バックエンドエンジニア」は、期限内に企業から返事がなかったため不成立となりました。',
        ]);
    });

    it('does not notify when the company\'s answer is rejected', function () {
        $like = likeOnTestPosting(['response_deadline' => now()->subMinute()]);

        $this->actingAs($like->jobPosting->company, 'company')
            ->postJson("/api/company/likes/{$like->id}/match")
            ->assertUnprocessable();

        expect($like->user->notifications()->count())->toBe(0);
    });
});

describe('api', function () {
    it('lists the seeker\'s notifications newest first with the unread count', function () {
        $user = User::factory()->create();
        $older = sendTestNotification($user, ['message' => '古い通知'], now()->subDay(), read: true);
        $newer = sendTestNotification($user, ['message' => '新しい通知'], now());
        // 他の人の通知は含めない
        sendTestNotification(User::factory()->create(), ['message' => '他の人の通知'], now());

        $this->actingAs($user, 'web')
            ->getJson('/api/seeker/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.0.message', '新しい通知')
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonPath('meta.unread_count', 1);
    });

    it('returns only the unread count for the header', function () {
        $company = Company::factory()->create();
        sendTestNotification($company, [], now());
        sendTestNotification($company, [], now());
        sendTestNotification($company, [], now(), read: true);

        $this->actingAs($company, 'company')
            ->getJson('/api/company/notifications/unread-count')
            ->assertOk()
            ->assertExactJson(['data' => ['unread_count' => 2]]);
    });

    it('marks a notification as read', function () {
        $user = User::factory()->create();
        $notification = sendTestNotification($user, [], now());

        $this->actingAs($user, 'web')
            ->postJson("/api/seeker/notifications/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('data.id', $notification->id);

        expect($notification->fresh()->read_at)->not->toBeNull();
    });

    it('returns 404 for someone else\'s notification', function () {
        $notification = sendTestNotification(User::factory()->create(), [], now());

        $this->actingAs(User::factory()->create(), 'web')
            ->postJson("/api/seeker/notifications/{$notification->id}/read")
            ->assertNotFound();

        expect($notification->fresh()->read_at)->toBeNull();
    });

    it('keeps seeker and company notifications apart even when their ids match', function () {
        // 求職者と企業は別のテーブルのため、同じIDになりうる
        $user = User::factory()->create();
        $company = Company::factory()->create();
        $company->forceFill(['id' => $user->id])->save();
        sendTestNotification($user, ['message' => '求職者への通知'], now());

        $this->actingAs($company, 'company')
            ->getJson('/api/company/notifications')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/seeker/notifications')->assertUnauthorized();
        $this->getJson('/api/company/notifications/unread-count')->assertUnauthorized();
    });
});

/**
 * テスト用に通知を1件保存する
 *
 * @param  array<string, mixed>  $data
 */
function sendTestNotification(User|Company $notifiable, array $data, DateTimeInterface $createdAt, bool $read = false): DatabaseNotification
{
    return $notifiable->notifications()->create([
        'id' => Str::uuid()->toString(),
        'type' => LikeResultNotification::class,
        'data' => ['kind' => 'matched', 'like_id' => 1, 'message' => 'テストの通知', ...$data],
        'read_at' => $read ? now() : null,
        'created_at' => $createdAt,
    ]);
}
