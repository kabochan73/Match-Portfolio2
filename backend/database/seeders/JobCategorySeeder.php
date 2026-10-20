<?php

namespace Database\Seeders;

use App\Models\JobCategory;
use Illuminate\Database\Seeder;

/**
 * 職種マスタの初期データを投入する。
 * nameをキーにupsertするため、何度実行しても重複せず、職種を追加した時も再実行で反映できる
 */
class JobCategorySeeder extends Seeder
{
    /**
     * 分類ごとの職種一覧(表示順もこの並び順)
     *
     * @var array<string, list<string>>
     */
    private const CATEGORIES = [
        '開発' => ['バックエンド', 'フロントエンド', 'フルスタック', 'iOS', 'Android', '組み込み・IoT', 'ゲーム'],
        'インフラ' => ['インフラ', 'SRE', 'クラウド', 'ネットワーク', 'セキュリティ'],
        'データ・AI' => ['データエンジニア', 'データサイエンティスト', '機械学習エンジニア'],
        '品質・運用' => ['QA・テスト', '社内SE・情報システム'],
        'マネジメント' => ['テックリード', 'エンジニアリングマネージャー', 'プロジェクトマネージャー', 'プロダクトマネージャー'],
        'その他' => ['UI/UXデザイナー', 'Webディレクター', 'セールスエンジニア', 'ITコンサルタント'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [];
        $sortOrder = 1;

        foreach (self::CATEGORIES as $groupName => $names) {
            foreach ($names as $name) {
                $rows[] = [
                    'name' => $name,
                    'group_name' => $groupName,
                    'sort_order' => $sortOrder++,
                ];
            }
        }

        JobCategory::upsert($rows, uniqueBy: ['name'], update: ['group_name', 'sort_order']);
    }
}
