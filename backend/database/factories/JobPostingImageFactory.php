<?php

namespace Database\Factories;

use App\Models\JobPosting;
use App\Models\JobPostingImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<JobPostingImage>
 */
class JobPostingImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_posting_id' => JobPosting::factory(),
            // 実際のファイルは作らない、ダミーの相対パス
            'path' => 'job-posting-images/'.Str::random(20).'.jpg',
        ];
    }
}
