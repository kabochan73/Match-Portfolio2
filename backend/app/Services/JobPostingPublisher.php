<?php

namespace App\Services;

use App\Enums\JobPostingStatus;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * 求人の公開・募集終了(状態の切り替え)。
 * 状態の変更はこのクラスだけで行い、公開中件数の上限チェックを1か所に集める
 */
class JobPostingPublisher
{
    /**
     * 公開する(下書きからの初回公開、または募集終了からの再開)。
     * published_atは初回公開の時だけ記録し、再開では変えない(NEWラベルや新着順に戻らないようにするため)
     *
     * @throws ValidationException
     */
    public function publish(JobPosting $jobPosting): void
    {
        DB::transaction(function () use ($jobPosting) {
            // 同じ企業の公開処理を1件ずつ順番に実行させ、ほぼ同時に公開されても上限を超えないようにする
            Company::query()->whereKey($jobPosting->company_id)->lockForUpdate()->first();

            $jobPosting->refresh();

            if ($jobPosting->status === JobPostingStatus::Published) {
                $this->fail('この求人はすでに公開中です。');
            }

            $publishedCount = JobPosting::query()
                ->where('company_id', $jobPosting->company_id)
                ->where('status', JobPostingStatus::Published)
                ->count();

            if ($publishedCount >= JobPosting::MAX_PUBLISHED_PER_COMPANY) {
                $this->fail('公開中の求人が上限('.JobPosting::MAX_PUBLISHED_PER_COMPANY.'件)に達しています。他の求人を募集終了にしてから公開してください。');
            }

            $jobPosting->update([
                'status' => JobPostingStatus::Published,
                'published_at' => $jobPosting->published_at ?? now(),
            ]);
        });
    }

    /**
     * 募集終了にする。反応待ちのいいねはそのまま残し、企業は引き続きマッチ・見送りを返せる
     *
     * @throws ValidationException
     */
    public function close(JobPosting $jobPosting): void
    {
        if ($jobPosting->status !== JobPostingStatus::Published) {
            $this->fail('公開中の求人だけ募集終了にできます。');
        }

        $jobPosting->update(['status' => JobPostingStatus::Closed]);
    }

    /**
     * 状態の切り替えができない理由を、画面に表示できる形(422)で返す
     *
     * @throws ValidationException
     */
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['status' => $message]);
    }
}
