<?php

namespace App\Console\Commands;

use App\Services\LikeExpirer;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('likes:expire')]
#[Description('企業の返事の期限(7日)を過ぎたいいねを、期限切れ(不成立)にする')]
class ExpireLikes extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(LikeExpirer $expirer): int
    {
        $count = $expirer->expireOverdue();

        $this->info("{$count}件のいいねを期限切れにしました。");

        return self::SUCCESS;
    }
}
