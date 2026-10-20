<?php

namespace App\Http\Resources;

use App\Models\CompanyImage;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CompanyImage
 */
class CompanyImageResource extends JsonResource
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
            'url' => app(ImageStorage::class)->url($this->path),
        ];
    }
}
