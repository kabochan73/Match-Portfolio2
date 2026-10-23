<?php

namespace App\Models;

use App\Enums\LikeStatus;
use App\Enums\LikeType;
use Carbon\CarbonImmutable;
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
     * 企業が反応する期限(いいねしてから何日か)
     */
    public const RESPONSE_DAYS = 7;

    /**
     * 月間上限の「月初」を区切るタイムゾーン。保存・APIの日時はUTCのまま、上限の計算だけ日本時間の1日0時で区切る
     */
    public const QUOTA_TIMEZONE = 'Asia/Tokyo';

    /**
     * 今月(日本時間)の始まり。この日時以降に作ったいいねを月間上限の対象として数える
     */
    public static function currentQuotaPeriodStart(): CarbonImmutable
    {
        return CarbonImmutable::now(self::QUOTA_TIMEZONE)->startOfMonth()->utc();
    }

    /**
     * 次に上限が回復する日時(日本時間の翌月1日0時)
     */
    public static function nextQuotaReset(): CarbonImmutable
    {
        return CarbonImmutable::now(self::QUOTA_TIMEZONE)->startOfMonth()->addMonth()->utc();
    }

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
