<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 求職者本人に返す情報。パスワード等の秘匿情報は含めない
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
            'avatar_path' => $this->avatar_path,
        ];
    }
}
