<?php

namespace App\Models;

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use Database\Factories\LikeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * いいね(=応募)。応募とは別のテーブルは持たず、いいね自体が応募の意思表示になる
 */
#[Fillable(['like_type', 'motivation', 'status', 'response_deadline', 'responded_at'])]
class Like extends Model
{
    /** @use HasFactory<LikeFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'like_type' => LikeType::class,
            'status' => LikeStatus::class,
            'response_deadline' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    /**
     * いいねした求職者
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * いいねされた求人
     *
     * @return BelongsTo<JobPosting, $this>
     */
    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}
