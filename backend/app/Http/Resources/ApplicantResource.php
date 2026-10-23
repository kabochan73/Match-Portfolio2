<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 企業に見せる応募者(求職者)。生年月日ではなく年齢を返し、メールアドレスはマッチ後だけ含める
 *
 * @mixin User
 */
class ApplicantResource extends JsonResource
{
    /**
     * @param  bool  $revealEmail  マッチ成立していればtrue(連絡先を開示する)
     */
    public function __construct(User $resource, private readonly bool $revealEmail = false)
    {
        parent::__construct($resource);
    }

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
            'age' => $this->age(),
            'avatar_url' => app(ImageStorage::class)->url($this->avatar_path),
            'comment' => $this->comment,
            'portfolio_url' => $this->portfolio_url,
            'email' => $this->when($this->revealEmail, $this->email),
            'work_experiences' => WorkExperienceResource::collection($this->whenLoaded('workExperiences')),
            'educations' => EducationResource::collection($this->whenLoaded('educations')),
            'certifications' => CertificationResource::collection($this->whenLoaded('certifications')),
        ];
    }
}
