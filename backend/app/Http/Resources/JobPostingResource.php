<?php

namespace App\Http\Resources;

use App\Models\JobPosting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求人(求人票)。関連データは読み込まれている時だけ、件数は数えられている時だけ含める
 *
 * @mixin JobPosting
 */
class JobPostingResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'desired_candidate' => $this->desired_candidate,
            'employment_type' => [
                'value' => $this->employment_type->value,
                'label' => $this->employment_type->label(),
            ],
            'prefecture' => [
                'value' => $this->prefecture->value,
                'label' => $this->prefecture->label(),
            ],
            // 月給(円)。万円での表示はフロントで行う
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'selection_steps' => $this->selection_steps,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'published_at' => $this->published_at?->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'job_categories' => JobCategoryResource::collection($this->whenLoaded('jobCategories')),
            'tech_stacks' => TechStackResource::collection($this->whenLoaded('techStacks')),
            'images' => JobPostingImageResource::collection($this->whenLoaded('images')),
            'likes_count' => $this->whenCounted('likes'),
            // 企業の反応待ち(applied)の件数。求人管理画面で対応漏れを知らせるために使う
            'pending_likes_count' => $this->whenCounted('pending_likes'),
        ];
    }
}
