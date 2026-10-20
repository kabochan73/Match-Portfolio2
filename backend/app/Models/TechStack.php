<?php

namespace App\Models;

use Database\Factories\TechStackFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 技術スタックマスタ。企業ページ・求人票・求人検索で共通利用する
 */
#[Fillable(['name', 'group_name', 'sort_order'])]
#[WithoutTimestamps]
class TechStack extends Model
{
    /** @use HasFactory<TechStackFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}
