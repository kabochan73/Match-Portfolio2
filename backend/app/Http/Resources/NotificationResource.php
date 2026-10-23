<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\DatabaseNotification;

/**
 * アプリ内通知。文言は送った時点で作って保存しているため、そのまま表示できる
 *
 * @mixin DatabaseNotification
 */
class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // matched / declined / expired(求職者向け)、received(企業向け)
            'kind' => $this->data['kind'],
            'message' => $this->data['message'],
            // 押したときに開く応募(求職者は応募詳細、企業は応募者詳細)
            'like_id' => $this->data['like_id'],
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}
