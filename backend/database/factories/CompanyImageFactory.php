<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\CompanyImage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CompanyImage>
 */
class CompanyImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            // 実際のファイルは作らない、ダミーの相対パス
            'path' => 'company-images/'.Str::random(20).'.jpg',
        ];
    }
}
