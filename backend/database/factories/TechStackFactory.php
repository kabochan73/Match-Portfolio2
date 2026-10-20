<?php

namespace Database\Factories;

use App\Models\TechStack;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TechStack>
 */
class TechStackFactory extends Factory
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
            'group_name' => fake()->randomElement(['言語', 'バックエンド', 'フロントエンド', 'モバイル', 'インフラ・クラウド', 'データベース', 'AI・機械学習', 'ツール']),
            'sort_order' => fake()->numberBetween(1, 1000),
        ];
    }
}
