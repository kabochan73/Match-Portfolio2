<?php

namespace Database\Factories;

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Like>
 */
class LikeFactory extends Factory
{
    /**
     * 通常のいいねで、企業の反応待ちの状態
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $likedAt = Carbon::instance(fake()->dateTimeBetween('-6 days', 'now'));

        return [
            'user_id' => User::factory(),
            'job_posting_id' => JobPosting::factory()->published(),
            'like_type' => LikeType::Standard,
            'motivation' => fake()->realText(200),
            'status' => LikeStatus::Applied,
            'response_deadline' => $likedAt->copy()->addDays(7),
            'responded_at' => null,
            'created_at' => $likedAt,
            'updated_at' => $likedAt,
        ];
    }

    /**
     * スーパーいいね
     */
    public function super(): static
    {
        return $this->state(fn (array $attributes) => [
            'like_type' => LikeType::Super,
        ]);
    }

    /**
     * 企業が「気になる」を返し、マッチした状態
     */
    public function matched(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LikeStatus::Matched,
            'responded_at' => Carbon::parse($attributes['created_at'])->addDay(),
        ]);
    }

    /**
     * 企業が「見送り」を返した状態
     */
    public function declined(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LikeStatus::Declined,
            'responded_at' => Carbon::parse($attributes['created_at'])->addDay(),
        ]);
    }

    /**
     * 7日以内に企業の反応がなく、期限切れで不成立になった状態
     */
    public function expired(): static
    {
        $likedAt = Carbon::instance(fake()->dateTimeBetween('-30 days', '-8 days'));

        return $this->state(fn (array $attributes) => [
            'status' => LikeStatus::Expired,
            'response_deadline' => $likedAt->copy()->addDays(7),
            'responded_at' => null,
            'created_at' => $likedAt,
            'updated_at' => $likedAt,
        ]);
    }
}
