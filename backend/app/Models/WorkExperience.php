<?php

namespace App\Models;

use App\Enums\EmploymentType;
use Database\Factories\WorkExperienceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 求職者の職歴。職務経歴書の代わりとして企業に表示される
 */
#[Fillable(['company_name', 'started_on', 'ended_on', 'employment_type'])]
class WorkExperience extends Model
{
    /** @use HasFactory<WorkExperienceFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_on' => 'date',
            'ended_on' => 'date',
            'employment_type' => EmploymentType::class,
        ];
    }

    /**
     * この職歴を持つ求職者
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
