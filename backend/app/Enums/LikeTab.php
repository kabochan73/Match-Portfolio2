<?php

namespace App\Enums;

use App\Models\Like;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

/**
 * 応募状況・応募者一覧のタブ。不成立のタブには、見送りと期限切れの両方を表示する
 */
enum LikeTab: string
{
    // 求職者は「いいね済」、企業は「反応待ち」
    case Applied = 'applied';
    case Matched = 'matched';
    case Unsuccessful = 'unsuccessful';

    /**
     * このタブに表示するいいねの状態
     *
     * @return list<LikeStatus>
     */
    public function statuses(): array
    {
        return match ($this) {
            self::Applied => [LikeStatus::Applied],
            self::Matched => [LikeStatus::Matched],
            self::Unsuccessful => [LikeStatus::Declined, LikeStatus::Expired],
        };
    }

    /**
     * タブごとの件数(タブの横に表示する)。状態ごとに1回のSQLで数えてから、タブにまとめる
     *
     * @param  Builder<Like>|Relation<Like, *, *>  $likes  数える対象(求職者のいいね・企業が受け取ったいいねなど)
     * @return array<string, int>
     */
    public static function counts(Builder|Relation $likes): array
    {
        $countByStatus = $likes->clone()
            ->toBase()
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $counts = [];

        foreach (self::cases() as $tab) {
            $counts[$tab->value] = collect($tab->statuses())
                ->sum(fn (LikeStatus $status) => (int) ($countByStatus[$status->value] ?? 0));
        }

        return $counts;
    }
}
