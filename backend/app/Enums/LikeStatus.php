<?php

namespace App\Enums;

/**
 * いいね(=応募)の状態。
 * 応募状況ページのタブとの対応: Applied=いいね済(企業側は反応待ち) / Matched=マッチ / Declined・Expired=不成立
 */
enum LikeStatus: string
{
    // 企業の反応待ち
    case Applied = 'applied';
    // 企業が「気になる」を返しマッチ成立。企業に求職者のメールアドレスを開示する
    case Matched = 'matched';
    // 企業が「見送り」を返した。同じ求人には再度いいねできない
    case Declined = 'declined';
    // 7日以内に企業の反応がなく自動で不成立。同じ求人に再度いいねできる
    case Expired = 'expired';

    /**
     * 画面に表示する日本語の名称
     */
    public function label(): string
    {
        return match ($this) {
            self::Applied => 'いいね済',
            self::Matched => 'マッチ',
            self::Declined => '見送り',
            self::Expired => '期限切れ',
        };
    }
}
