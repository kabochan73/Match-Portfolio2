<?php

namespace App\Enums;

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
}
