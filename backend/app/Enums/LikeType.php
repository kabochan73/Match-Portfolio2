<?php

namespace App\Enums;

/**
 * いいねの種類。通常は月10件、スーパーいいねは別枠で月1件まで送れる
 */
enum LikeType: string
{
    case Standard = 'standard';
    case Super = 'super';

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
