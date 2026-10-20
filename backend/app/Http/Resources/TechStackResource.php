<?php

namespace App\Http\Resources;

use App\Models\TechStack;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TechStack
 */
class TechStackResource extends JsonResource
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
            'name' => $this->name,
            // 検索サイドバー等で分類ごとにまとめて表示するため
            'group_name' => $this->group_name,
        ];
    }
}
