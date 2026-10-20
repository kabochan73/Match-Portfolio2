<?php

namespace Database\Factories;

use App\Models\Education;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Education>
 */
class EducationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 日本語のFakerには学校名を作る機能がないため、候補を組み合わせて作る
        $school = fake()->randomElement(['東都大学', '西峰大学', '北嶺工業大学', '南海情報大学', '中央テクノロジー専門学校']);
        $faculty = fake()->randomElement(['情報工学部', '理工学部', '経済学部', '文学部', '情報処理科']);

        return [
            'user_id' => User::factory(),
            'school_name' => "{$school} {$faculty}",
        ];
    }
}
