<?php

namespace Database\Factories;

use App\Models\WorkStyle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkStyle>
 */
class WorkStyleFactory extends Factory
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
            'sort_order' => fake()->numberBetween(1, 1000),
        ];
    }
}
