<?php

namespace App\Http\Resources;

use App\Enums\LikeStatus;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 企業が受け取ったいいね(応募)。応募者と、どの求人への応募かを含める
 *
 * @mixin Like
 */
class ReceivedLikeResource extends JsonResource
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
            'like_type' => [
                'value' => $this->like_type->value,
                'label' => $this->like_type->label(),
            ],
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'motivation' => $this->motivation,
            'response_deadline' => $this->response_deadline,
            'responded_at' => $this->responded_at,
            'created_at' => $this->created_at,
            'job_posting' => $this->whenLoaded('jobPosting', fn () => [
                'id' => $this->jobPosting->id,
                'title' => $this->jobPosting->title,
            ]),
            // マッチ成立した応募者だけ、連絡先(メールアドレス)を開示する
            'applicant' => $this->whenLoaded(
                'user',
                fn () => new ApplicantResource($this->user, $this->status === LikeStatus::Matched),
            ),
        ];
    }
}
