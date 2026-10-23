<?php

namespace App\Http\Resources;

use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求職者本人に見せるいいね(応募)。応募先の求人は読み込んだときだけ含める
 *
 * @mixin Like
 */
class LikeResource extends JsonResource
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
            'job_posting' => new JobPostingSummaryResource($this->whenLoaded('jobPosting')),
        ];
    }
}
