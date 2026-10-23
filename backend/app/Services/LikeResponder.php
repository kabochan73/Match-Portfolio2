<?php

namespace App\Services;

use App\Enums\LikeStatus;
use App\Models\Like;
use App\Notifications\LikeResultNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * 企業がいいね(応募)に「気になる」または「見送り」を返す。返事できるかどうかのチェックをこのクラスに集める
 */
class LikeResponder
{
    /**
     * 気になる(マッチ成立)。以後、企業に求職者のメールアドレスを開示する
     *
     * @throws ValidationException
     */
    public function match(Like $like): void
    {
        $this->respond($like, LikeStatus::Matched);
    }

    /**
     * 見送り(不成立)。求職者は同じ求人に再度いいねできなくなる
     *
     * @throws ValidationException
     */
    public function decline(Like $like): void
    {
        $this->respond($like, LikeStatus::Declined);
    }

    /**
     * @throws ValidationException
     */
    private function respond(Like $like, LikeStatus $status): void
    {
        DB::transaction(function () use ($like, $status) {
            // 気になる・見送りがほぼ同時に押されても、先に届いた方だけを反映する
            $locked = Like::query()->whereKey($like->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== LikeStatus::Applied) {
                $this->fail('この応募にはすでに返事をしています。');
            }

            // 期限切れのバッチは1時間おきのため、状態がまだ反応待ちでも期限を過ぎていれば返事できない
            if ($locked->response_deadline->isPast()) {
                $this->fail('返事の期限(7日)を過ぎています。');
            }

            $locked->update([
                'status' => $status,
                'responded_at' => now(),
            ]);
        });

        $like->refresh();

        // 返事が確定してから、求職者に結果を知らせる
        $like->load(['user', 'jobPosting.company:id,name']);
        $like->user->notify(new LikeResultNotification($like));
    }

    /**
     * 返事できない理由を、画面に表示できる形(422)で返す
     *
     * @throws ValidationException
     */
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['status' => $message]);
    }
}
