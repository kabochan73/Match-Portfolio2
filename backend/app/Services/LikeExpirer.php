<?php

namespace App\Services;

use App\Enums\LikeStatus;
use App\Models\Like;
use App\Notifications\LikeResultNotification;

/**
 * 期限(7日)までに企業が返事をしなかったいいねを、自動で不成立(期限切れ)にし、求職者に知らせる
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
            // 通知の文言に使う求職者・求人・会社名を、まとめて読み込む
            ->with(['user', 'jobPosting.company:id,name'])
            ->chunkById(self::CHUNK_SIZE, function ($likes) use (&$expired) {
                foreach ($likes as $like) {
                    // 読み込んでから更新するまでに状態が変わっていないものだけを更新する
                    $updated = Like::query()
                        ->whereKey($like->id)
                        ->where('status', LikeStatus::Applied)
                        ->update(['status' => LikeStatus::Expired]);

                    if ($updated === 0) {
                        continue;
                    }

                    $like->status = LikeStatus::Expired;
                    $like->user->notify(new LikeResultNotification($like));
                    $expired++;
                }
            });

        return $expired;
    }
}
