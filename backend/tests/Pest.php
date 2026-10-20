<?php

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Featureテストはすべて Tests\TestCase(Laravelアプリを起動するテストケース)を継承する。
| DBを使うテストを書き始めた時点で RefreshDatabase をここに追加する。
|
*/

pest()->extend(TestCase::class)
    ->in('Feature');
