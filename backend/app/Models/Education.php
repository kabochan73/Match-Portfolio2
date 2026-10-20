<?php

namespace App\Models;

use Database\Factories\EducationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 求職者の学歴(学校名のみ)
 *
 * Laravelは"education"を不可算名詞として扱い、既定のテーブル名がeducationになるため、明示的に指定する。
 * 同じ理由で、ファクトリーのhas()はリレーション名を推測できないため、has(Education::factory(), 'educations')と明示する
 */
#[Table('educations')]
#[Fillable(['school_name'])]
class Education extends Model
{
    /** @use HasFactory<EducationFactory> */
    use HasFactory;

    /**
     * この学歴を持つ求職者
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
