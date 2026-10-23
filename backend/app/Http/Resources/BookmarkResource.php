<?php

namespace App\Http\Resources;

use App\Models\Bookmark;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求職者のブックマーク。求人カードの情報に、求人の状態(募集終了の表示用)と、自分の最新のいいねの状態(応募状況のバッジ用)を添える
 *
 * @mixin Bookmark
 */
class BookmarkResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Like|null $latestLike */
        $latestLike = $this->whenLoaded('latestLike');

        return [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'job_posting' => new JobPostingSummaryResource($this->jobPosting),
            'job_posting_status' => [
                'value' => $this->jobPosting->status->value,
                'label' => $this->jobPosting->status->label(),
            ],
            // いいねしていなければnull。期限切れのあとに再度いいねした場合は新しい方
            'latest_like' => $this->whenLoaded('latestLike', fn () => $latestLike === null ? null : [
                'id' => $latestLike->id,
                'status' => [
                    'value' => $latestLike->status->value,
                    'label' => $latestLike->status->label(),
                ],
            ]),
        ];
    }
}
