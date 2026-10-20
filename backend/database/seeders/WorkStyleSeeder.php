<?php

namespace Database\Seeders;

use App\Models\WorkStyle;
use Illuminate\Database\Seeder;

/**
 * 働き方マスタの初期データを投入する。
 * nameをキーにupsertするため、何度実行しても重複せず、選択肢を追加した時も再実行で反映できる
 */
class WorkStyleSeeder extends Seeder
{
    /**
     * 働き方の一覧(表示順もこの並び順)
     *
     * @var list<string>
     */
    private const WORK_STYLES = ['フルリモート', 'リモート併用', 'フレックスタイム', 'コアタイムなし', '副業OK', '服装自由', '時短勤務OK'];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [];

        foreach (self::WORK_STYLES as $index => $name) {
            $rows[] = [
                'name' => $name,
                'sort_order' => $index + 1,
            ];
        }

        WorkStyle::upsert($rows, uniqueBy: ['name'], update: ['sort_order']);
    }
}
