<?php

namespace App\Models;

use Database\Factories\WorkStyleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutTimestamps;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 働き方マスタ。企業ページの「働き方」で選択する
 */
#[Fillable(['name', 'sort_order'])]
#[WithoutTimestamps]
class WorkStyle extends Model
{
    /** @use HasFactory<WorkStyleFactory> */
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
