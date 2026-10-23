<?php

namespace App\Notifications;

use App\Models\Like;
use Illuminate\Notifications\Notification;

/**
 * 企業への、新しいいいね(応募)の通知。アプリ内通知のみ
 */
class LikeReceivedNotification extends Notification
{
    /**
     * @param  Like  $like  届いたいいね(求人と求職者を読み込んでおく)
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
     * 通知の一覧にそのまま表示する文言と、押したときに開く応募者のID
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'kind' => 'received',
            'like_id' => $this->like->id,
            'message' => "「{$this->like->jobPosting->title}」に{$this->like->user->name}さんから{$this->like->like_type->label()}が届きました。7日以内に返事をしてください。",
        ];
    }
}
