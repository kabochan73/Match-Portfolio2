<?php

namespace Database\Factories;

use App\Models\JobCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobCategory>
 */
class JobCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'group_name' => fake()->randomElement(['開発', 'インフラ', 'データ・AI', '品質・運用', 'マネジメント', 'その他']),
            'sort_order' => fake()->numberBetween(1, 1000),
        ];
    }
}
