<?php

use Illuminate\Support\Facades\Schedule;

// 返事の期限を過ぎたいいねを期限切れにする。本番ではschedulerのサービス(php artisan schedule:work)が実行する
Schedule::command('likes:expire')->hourly()->withoutOverlapping();

// 既読から90日たった通知を削除し、通知が増え続けないようにする(ほかのデータから参照されていないため、消しても壊れない)
Schedule::command('notifications:prune')->daily()->withoutOverlapping();
