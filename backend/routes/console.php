<?php

use Illuminate\Support\Facades\Schedule;

// 返事の期限を過ぎたいいねを期限切れにする。本番ではschedulerのサービス(php artisan schedule:work)が実行する
Schedule::command('likes:expire')->hourly()->withoutOverlapping();
