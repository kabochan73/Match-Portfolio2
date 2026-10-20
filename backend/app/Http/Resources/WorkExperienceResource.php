<?php

namespace App\Http\Resources;

use App\Models\WorkExperience;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin WorkExperience
 */
class WorkExperienceResource extends JsonResource
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
            'company_name' => $this->company_name,
            // 年月のみ扱うため「2024-04」の形で返す(フロントの<input type="month">にそのまま渡せる)
            'started_on' => $this->started_on->format('Y-m'),
            // nullは在籍中
            'ended_on' => $this->ended_on?->format('Y-m'),
            'employment_type' => [
                'value' => $this->employment_type->value,
                'label' => $this->employment_type->label(),
            ],
        ];
    }
}
