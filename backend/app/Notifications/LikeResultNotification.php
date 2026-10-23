<?php

namespace App\Notifications;

use App\Enums\LikeStatus;
use App\Models\Like;
use Illuminate\Notifications\Notification;

/**
 * 求職者への、いいね(応募)の結果の通知(マッチ成立・見送り・期限切れ)。アプリ内通知のみ
 */
class LikeResultNotification extends Notification
{
    /**
     * @param  Like  $like  結果が決まったいいね(求人と会社を読み込んでおく)
     */
    public function __construct(private readonly Like $like) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * 通知の一覧にそのまま表示する文言と、押したときに開く応募のID
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => $this->like->status->value,
            'like_id' => $this->like->id,
            'message' => $this->message(),
        ];
    }

    private function message(): string
    {
        $target = "{$this->like->jobPosting->company->name}の「{$this->like->jobPosting->title}」";

        return match ($this->like->status) {
            LikeStatus::Matched => "{$target}とマッチしました。企業から登録メールアドレスに連絡が届きます。",
            LikeStatus::Declined => "{$target}は、今回は見送りとなりました。",
            LikeStatus::Expired => "{$target}は、期限内に企業から返事がなかったため不成立となりました。",
            LikeStatus::Applied => throw new \LogicException('結果が決まっていないいいねは通知しません。'),
        };
    }
}
