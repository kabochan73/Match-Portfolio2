<?php

namespace App\Enums;

/**
 * 求人の公開状態。下書き → 公開中 ⇄ 募集終了 と遷移する(募集終了から再開できる)
 */
enum JobPostingStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Closed = 'closed';

    /**
     * 画面に表示する日本語の名称
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => '下書き',
            self::Published => '公開中',
            self::Closed => '募集終了',
        };
    }
}
