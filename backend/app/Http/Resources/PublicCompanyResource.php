<?php

namespace App\Http\Resources;

use App\Models\Company;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求職者に見せる企業の情報(求人詳細の会社カード・企業ページ)。
 * ログインIDであるメールアドレスは含めない(企業本人向けはCompanyResource)。
 * 技術スタック・働き方・ギャラリー・募集中の求人は、読み込まれている時だけ含める
 *
 * @mixin Company
 */
class PublicCompanyResource extends JsonResource
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
            'introduction' => $this->introduction,
            'business_description' => $this->business_description,
            'culture' => $this->culture,
            'founded_year' => $this->founded_year,
            'member_count' => $this->member_count,
            'prefecture' => $this->prefecture === null ? null : [
                'value' => $this->prefecture->value,
                'label' => $this->prefecture->label(),
            ],
            'address_line' => $this->address_line,
            'website_url' => $this->website_url,
            'tech_stacks' => TechStackResource::collection($this->whenLoaded('techStacks')),
            'work_styles' => WorkStyleResource::collection($this->whenLoaded('workStyles')),
            'images' => CompanyImageResource::collection($this->whenLoaded('images')),
            'job_postings' => JobPostingSummaryResource::collection($this->whenLoaded('jobPostings')),
        ];
    }
}
