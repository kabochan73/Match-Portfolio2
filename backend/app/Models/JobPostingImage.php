<?php

namespace App\Models;

use Database\Factories\JobPostingImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 求人票の画像ギャラリーの1枚
 */
#[Fillable(['path'])]
class JobPostingImage extends Model
{
    /** @use HasFactory<JobPostingImageFactory> */
    use HasFactory;

    /**
     * この画像を持つ求人
     *
     * @return BelongsTo<JobPosting, $this>
     */
    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}
