<?php

namespace App\Http\Resources;

use App\Models\Company;
use App\Services\ImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 企業本人に返す情報(ログインIDのメールアドレスを含む)。
 * 求職者に公開する企業ページ用は、メールアドレスを含めない別のリソースにする。
 * 技術スタック・働き方・ギャラリーは、読み込まれている時だけ含める(/meでは含めず、/profileでは含める)
 *
 * @mixin Company
 */
class CompanyResource extends JsonResource
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
            // 保存場所(パス)ではなく、画面にそのまま表示できるURLを返す
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
        ];
    }
}
