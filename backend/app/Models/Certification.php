<?php

namespace App\Models;

use Database\Factories\CertificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 求職者の資格(資格名のみ。取得年月は管理しない)
 */
#[Fillable(['name'])]
class Certification extends Model
{
    /** @use HasFactory<CertificationFactory> */
    use HasFactory;

    /**
     * この資格を持つ求職者
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
