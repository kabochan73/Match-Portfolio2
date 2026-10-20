<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求職者本人に返す情報。パスワード等の秘匿情報は含めない。
 * 職歴・学歴・資格は、読み込まれている時だけ含める(/meでは含めず、/profileでは含める)
 *
 * @mixin User
 */
class UserResource extends JsonResource
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
            'email' => $this->email,
            'comment' => $this->comment,
            'portfolio_url' => $this->portfolio_url,
            'birth_date' => $this->birth_date->toDateString(),
            // 保存場所(パス)ではなく、画面にそのまま表示できるURLを返す
            'avatar_url' => app(ImageStorage::class)->url($this->avatar_path),
            'work_experiences' => WorkExperienceResource::collection($this->whenLoaded('workExperiences')),
            'educations' => EducationResource::collection($this->whenLoaded('educations')),
            'certifications' => CertificationResource::collection($this->whenLoaded('certifications')),
        ];
    }
}
