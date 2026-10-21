<?php

use Database\Seeders\MasterSeeder;

it('returns every option for search and forms without logging in', function () {
    $this->seed(MasterSeeder::class);

    $this->getJson('/api/masters')
        ->assertOk()
        ->assertJsonCount(25, 'data.job_categories')
        ->assertJsonCount(46, 'data.tech_stacks')
        ->assertJsonCount(7, 'data.work_styles')
        ->assertJsonCount(48, 'data.prefectures')
        ->assertJsonCount(5, 'data.employment_types')
        // マスタは表示順(sort_order)、enumは定義順。
        // IDはPostgreSQLの連番がテストのロールバックで戻らず、他のテストの後だと1にならないため確かめない
        ->assertJsonPath('data.job_categories.0.name', 'バックエンド')
        ->assertJsonPath('data.job_categories.0.group_name', '開発')
        ->assertJsonPath('data.tech_stacks.0.name', 'PHP')
        ->assertJsonPath('data.work_styles.0.name', 'フルリモート')
        ->assertJsonPath('data.prefectures.12', ['value' => 'tokyo', 'label' => '東京'])
        ->assertJsonPath('data.prefectures.47', ['value' => 'remote', 'label' => 'リモート'])
        ->assertJsonPath('data.employment_types.0', ['value' => 'full_time', 'label' => '正社員']);
});
