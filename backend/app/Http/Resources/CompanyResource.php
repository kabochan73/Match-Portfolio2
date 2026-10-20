<?php

namespace App\Http\Resources;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 企業本人に返す情報(ログインIDのメールアドレスを含む)。
 * 求職者に公開する企業ページ用は、メールアドレスを含めない別のリソースにする
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
            'avatar_path' => $this->avatar_path,
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
        ];
    }
}
