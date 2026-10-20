<?php

namespace Database\Seeders;

use App\Models\TechStack;
use Illuminate\Database\Seeder;

/**
 * 技術スタックマスタの初期データを投入する。
 * nameをキーにupsertするため、何度実行しても重複せず、技術を追加した時も再実行で反映できる
 */
class TechStackSeeder extends Seeder
{
    /**
     * 分類ごとの技術一覧(表示順もこの並び順)
     *
     * @var array<string, list<string>>
     */
    private const STACKS = [
        '言語' => ['PHP', 'JavaScript', 'TypeScript', 'Python', 'Ruby', 'Go', 'Java', 'Kotlin', 'Swift', 'C#', 'Rust', 'Dart', 'Scala', 'C++'],
        'バックエンド' => ['Laravel', 'Ruby on Rails', 'Django', 'FastAPI', 'Spring Boot', 'Express', 'NestJS', '.NET'],
        'フロントエンド' => ['React', 'Next.js', 'Vue.js', 'Nuxt', 'Angular', 'Svelte'],
        'モバイル' => ['Flutter', 'React Native'],
        'インフラ・クラウド' => ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Firebase'],
        'データベース' => ['MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'BigQuery'],
        'AI・機械学習' => ['TensorFlow', 'PyTorch'],
        'ツール' => ['Git', 'GitHub Actions'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [];
        $sortOrder = 1;

        foreach (self::STACKS as $groupName => $names) {
            foreach ($names as $name) {
                $rows[] = [
                    'name' => $name,
                    'group_name' => $groupName,
                    'sort_order' => $sortOrder++,
                ];
            }
        }

        TechStack::upsert($rows, uniqueBy: ['name'], update: ['group_name', 'sort_order']);
    }
}
