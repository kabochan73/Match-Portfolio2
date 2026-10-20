<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<WorkExperience>
 */
class WorkExperienceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 年月のみ扱うため、開始・終了とも月の1日に揃える
        $startedOn = Carbon::instance(fake()->dateTimeBetween('-10 years', '-1 year'))->startOfMonth();
        $endedOn = Carbon::instance(fake()->dateTimeBetween($startedOn, 'now'))->startOfMonth();

        return [
            'user_id' => User::factory(),
            'company_name' => fake()->company(),
            'started_on' => $startedOn->toDateString(),
            'ended_on' => $endedOn->toDateString(),
            'employment_type' => fake()->randomElement(EmploymentType::cases()),
        ];
    }

    /**
     * 在籍中の職歴(終了年月なし)
     */
    public function current(): static
    {
        return $this->state(fn (array $attributes) => [
            'ended_on' => null,
        ]);
    }
}
