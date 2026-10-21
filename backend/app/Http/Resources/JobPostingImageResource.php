<?php

namespace App\Http\Resources;

use App\Models\JobPostingImage;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin JobPostingImage
 */
class JobPostingImageResource extends JsonResource
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
