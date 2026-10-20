<?php

namespace App\Models;

use Database\Factories\CompanyImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 企業ページの写真ギャラリーの1枚
 */
#[Fillable(['path'])]
class CompanyImage extends Model
{
    /** @use HasFactory<CompanyImageFactory> */
    use HasFactory;

    /**
     * この写真を持つ企業
     *
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
