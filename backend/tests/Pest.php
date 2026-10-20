<?php

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Featureテストはすべて Tests\TestCase(Laravelアプリを起動するテストケース)を継承する。
| LazilyRefreshDatabaseは、DBを使うテストの時だけマイグレーションを実行し、テストごとにDBを元に戻す。
|
| SanctumのstatefulApiは、Origin(またはReferer)がフロントエンド(SANCTUM_STATEFUL_DOMAINS)の
| リクエストにだけセッションを有効にする。実際のSPAからの呼び出しと同じ条件にするため、全リクエストに付ける。
|
*/

pest()->extend(TestCase::class)
    ->use(LazilyRefreshDatabase::class)
    ->beforeEach(function () {
        $this->withHeader('Origin', 'http://localhost:3000');
    })
    ->in('Feature');
