<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * マスタとデモ用のデータを投入する(php artisan migrate:fresh --seed で、デモの状態を作り直せる)
     */
    public function run(): void
    {
        $this->call([
            MasterSeeder::class,
            DemoSeeder::class,
        ]);
    }
}
