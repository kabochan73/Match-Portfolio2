<?php

namespace App\Http\Resources;

use App\Models\JobPosting;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求人カード用の軽い情報。一覧で24件まとめて返すため、仕事内容などの長い本文は含めない
 *
 * @mixin JobPosting
 */
class JobPostingSummaryResource extends JsonResource
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
            'company' => new CompanySummaryResource($this->whenLoaded('company')),
            'job_categories' => JobCategoryResource::collection($this->whenLoaded('jobCategories')),
            'tech_stacks' => TechStackResource::collection($this->whenLoaded('techStacks')),
            'prefecture' => [
                'value' => $this->prefecture->value,
                'label' => $this->prefecture->label(),
            ],
            'employment_type' => [
                'value' => $this->employment_type->value,
                'label' => $this->employment_type->label(),
            ],
            'salary' => $this->salary,
            'likes_count' => $this->whenCounted('likes'),
            'is_new' => $this->isNew(),
            // 画像ギャラリーの1枚目をカバー画像にする(読み込み時に1枚目だけに絞っている)
            'cover_image_url' => $this->whenLoaded(
                'images',
                fn () => app(ImageStorage::class)->url($this->images->first()?->path),
            ),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
