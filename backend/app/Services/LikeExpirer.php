<?php

namespace App\Services;

use App\Enums\LikeStatus;
use App\Models\Like;

/**
 * 期限(7日)までに企業が返事をしなかったいいねを、自動で不成立(期限切れ)にする
 */
class LikeExpirer
{
    /** 1回に読み込む件数(期限切れがまとめて出ても、メモリを使いすぎないよう区切って処理する) */
    private const CHUNK_SIZE = 200;

    /**
     * 期限を過ぎた反応待ちのいいねを期限切れにする
     *
     * @return int 期限切れにした件数
     */
    public function expireOverdue(): int
    {
        $expired = 0;

        Like::query()
            ->where('status', LikeStatus::Applied)
            ->where('response_deadline', '<=', now())
            ->chunkById(self::CHUNK_SIZE, function ($likes) use (&$expired) {
                foreach ($likes as $like) {
                    // 読み込んでから更新するまでに状態が変わっていないものだけを更新する
                    $updated = Like::query()
                        ->whereKey($like->id)
                        ->where('status', LikeStatus::Applied)
                        ->update(['status' => LikeStatus::Expired]);

                    $expired += $updated;
                }
            });

        return $expired;
    }
}
