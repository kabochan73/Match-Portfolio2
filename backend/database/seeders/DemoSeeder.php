<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * デモ用のデータ一式(企業・求人 → 求職者 → いいね・ブックマーク・通知)。マスタ(MasterSeeder)のあとに実行する。
 * ログインできるのはデモ用の求職者アカウントと企業アカウントだけ(ログイン画面に案内を出す)
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DemoCompanySeeder::class,
            DemoSeekerSeeder::class,
            DemoActivitySeeder::class,
        ]);
    }
}
