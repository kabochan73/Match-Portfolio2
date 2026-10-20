<?php

namespace Database\Factories;

use App\Models\Certification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certification>
 */
class CertificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            // 日本語のFakerには資格名を作る機能がないため、IT系の資格から選ぶ
            'name' => fake()->randomElement([
                '基本情報技術者',
                '応用情報技術者',
                'データベーススペシャリスト',
                'ネットワークスペシャリスト',
                'AWS Certified Solutions Architect - Associate',
                'Google Cloud Professional Cloud Architect',
                'LPIC-1',
                'TOEIC 800点',
            ]),
        ];
    }
}
