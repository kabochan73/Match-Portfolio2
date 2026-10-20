<?php

namespace Database\Factories;

use App\Enums\Prefecture;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * 会員登録直後の状態(会社名・メールアドレス・パスワードのみ)
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'email' => fake()->unique()->companyEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * 企業ページの項目をひととおり入力した状態
     */
    public function withProfile(): static
    {
        return $this->state(fn (array $attributes) => [
            'introduction' => fake()->realText(100),
            'business_description' => fake()->realText(400),
            'culture' => fake()->realText(400),
            'founded_year' => fake()->numberBetween(1990, (int) date('Y')),
            'member_count' => fake()->numberBetween(5, 500),
            // 企業の所在地にはリモートを選べない
            'prefecture' => fake()->randomElement(array_filter(
                Prefecture::cases(),
                fn (Prefecture $prefecture) => $prefecture !== Prefecture::Remote,
            )),
            'address_line' => fake()->city().fake()->streetAddress(),
            'website_url' => fake()->url(),
        ]);
    }
}
