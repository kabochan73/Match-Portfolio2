<?php

namespace App\Enums;

/**
 * いいねの種類。通常は月5件、スーパーいいねは別枠で月1件まで送れる
 */
enum LikeType: string
{
    case Standard = 'standard';
    case Super = 'super';

    /**
     * 1か月に送れる数(月初にリセット。通常とスーパーは別枠)
     */
    public function monthlyLimit(): int
    {
        return match ($this) {
            self::Standard => 5,
            self::Super => 1,
        };
    }

    /**
     * 画面に表示する日本語の名称
     */
    public function label(): string
    {
        return match ($this) {
            self::Standard => 'いいね',
            self::Super => 'スーパーいいね',
        };
    }
}
