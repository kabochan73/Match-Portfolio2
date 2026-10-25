<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;

#[Signature('notifications:prune')]
#[Description('既読にしてから90日たった通知を削除する(未読の通知は残す)')]
class PruneReadNotifications extends Command
{
    /** 既読にしてから何日で削除するか */
    public const KEEP_DAYS = 90;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = DatabaseNotification::query()
            ->where('read_at', '<', now()->subDays(self::KEEP_DAYS))
            ->delete();

        $this->info("{$count}件の通知を削除しました。");

        return self::SUCCESS;
    }
}
