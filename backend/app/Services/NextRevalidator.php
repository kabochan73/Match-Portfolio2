<?php

namespace App\Services;

use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

use function Illuminate\Support\defer;

/**
 * 公開ページのデータが変わったことをNext.jsに知らせ、キャッシュを作り直させる(/internal/revalidate)。
 * 通知はレスポンスを返したあとに送り、失敗しても元の操作(編集・いいねなど)は成功のままにする(ログだけ残す)。
 * 届かなかった場合も、Next.js側のキャッシュは1日で作り直される
 */
class NextRevalidator
{
    /** Next.jsが応答しないときに待つ秒数 */
    private const TIMEOUT_SECONDS = 3;

    /**
     * 求人が変わった。求人詳細と、その求人が載る企業ページを作り直す
     *
     * @param  bool  $listChanged  公開・募集終了・削除で、求人一覧に出る・消えるときはtrue(一覧も作り直す)
     */
    public function jobPostingChanged(JobPosting $jobPosting, bool $listChanged = false): void
    {
        $tags = ["job-{$jobPosting->id}", "company-{$jobPosting->company_id}"];

        if ($listChanged) {
            $tags[] = 'jobs';
        }

        $this->revalidate($tags);
    }

    /**
     * 企業ページの内容が変わった。企業ページと、会社カードを含むその会社の求人詳細を作り直す
     * (求人詳細にもcompany-{id}のタグが付いているため、1つのタグでまとめて作り直せる)
     */
    public function companyChanged(Company $company): void
    {
        $this->revalidate(["company-{$company->id}"]);
    }

    /**
     * @param  list<string>  $tags
     */
    private function revalidate(array $tags): void
    {
        $url = config('services.frontend.revalidate_url');
        $secret = config('services.frontend.revalidate_secret');

        if (blank($url) || blank($secret)) {
            return;
        }

        defer(function () use ($url, $secret, $tags) {
            try {
                Http::timeout(self::TIMEOUT_SECONDS)
                    ->withHeaders(['X-Revalidate-Secret' => $secret])
                    ->post($url, ['tags' => $tags])
                    ->throw();
            } catch (Throwable $exception) {
                Log::warning('Next.jsへの再検証の通知に失敗しました', [
                    'tags' => $tags,
                    'error' => $exception->getMessage(),
                ]);
            }
        });
    }
}
