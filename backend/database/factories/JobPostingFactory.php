<?php

namespace Database\Factories;

use App\Enums\EmploymentType;
use App\Enums\JobPostingStatus;
use App\Enums\Prefecture;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobPosting>
 */
class JobPostingFactory extends Factory
{
    /**
     * 下書きの状態(DBの初期値と同じ)
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'title' => fake()->randomElement([
                '自社SaaSを開発するバックエンドエンジニア',
                'デザインシステムを育てるフロントエンドエンジニア',
                'サービスの信頼性を支えるSRE',
                '新規事業のフルスタックエンジニア',
                'モバイルアプリ開発エンジニア',
            ]),
            'description' => fake()->realText(400),
            'desired_candidate' => fake()->realText(200),
            'employment_type' => fake()->randomElement(EmploymentType::cases()),
            'prefecture' => fake()->randomElement(Prefecture::cases()),
            // 月給は万円単位で作り、円に変換して保存する
            'salary' => fake()->numberBetween(25, 80) * 10000,
            'selection_steps' => ['カジュアル面談', '一次面接', '最終面接', '内定'],
            'status' => JobPostingStatus::Draft,
            'published_at' => null,
        ];
    }

    /**
     * 公開中の求人(過去60日以内に初回公開)
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => JobPostingStatus::Published,
            'published_at' => fake()->dateTimeBetween('-60 days', 'now'),
        ]);
    }

    /**
     * 募集終了した求人(一度は公開されているため、初回公開日時を持つ)
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => JobPostingStatus::Closed,
            'published_at' => fake()->dateTimeBetween('-120 days', '-30 days'),
        ]);
    }
}
