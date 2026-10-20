<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * マスタ(職種・技術スタック・働き方)だけを投入する。
 * 本番環境でも`php artisan db:seed --class=MasterSeeder`で実行する想定のため、
 * サンプルデータ(企業・求人など)はここに含めない
 */
class MasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            JobCategorySeeder::class,
            TechStackSeeder::class,
            WorkStyleSeeder::class,
        ]);
    }
}
