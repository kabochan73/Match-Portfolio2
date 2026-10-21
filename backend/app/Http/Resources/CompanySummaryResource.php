<?php

namespace App\Http\Resources;

use App\Models\Company;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求人カードや応募一覧などに添える、企業の最小限の情報(名前とロゴ)。メールアドレスは含めない
 *
 * @mixin Company
 */
class CompanySummaryResource extends JsonResource
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
            'avatar_url' => app(ImageStorage::class)->url($this->avatar_path),
        ];
    }
}
