<?php

namespace App\Models;

use App\Enums\EmploymentType;
use App\Enums\JobPostingStatus;
use App\Enums\Prefecture;
use Database\Factories\JobPostingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 求人(求人票)
 */
#[Fillable([
    'title',
    'description',
    'desired_candidate',
    'employment_type',
    'prefecture',
    'salary_min',
    'salary_max',
    'selection_steps',
    'status',
    'published_at',
])]
class JobPosting extends Model
{
    /** @use HasFactory<JobPostingFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'employment_type' => EmploymentType::class,
            'prefecture' => Prefecture::class,
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'selection_steps' => 'array',
            'status' => JobPostingStatus::class,
            'published_at' => 'datetime',
        ];
    }

    /**
     * この求人を出している企業
     *
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
