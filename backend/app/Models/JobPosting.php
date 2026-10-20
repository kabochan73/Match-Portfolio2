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
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    /**
     * 求人票の画像ギャラリー(最大5枚、登録順に表示。1枚目がカバー画像)
     *
     * @return HasMany<JobPostingImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(JobPostingImage::class);
    }

    /**
     * 職種(1〜3件)
     *
     * Laravelの命名規則(モデル名のアルファベット順)ではjob_category_job_postingになるが、
     * 「求人に付く職種」と読めるよう、設計どおりjob_posting_job_categoryとし、テーブル名を明示する
     *
     * @return BelongsToMany<JobCategory, $this>
     */
    public function jobCategories(): BelongsToMany
    {
        return $this->belongsToMany(JobCategory::class, 'job_posting_job_category');
    }

    /**
     * 技術スタック
     *
     * @return BelongsToMany<TechStack, $this>
     */
    public function techStacks(): BelongsToMany
    {
        return $this->belongsToMany(TechStack::class);
    }
}
