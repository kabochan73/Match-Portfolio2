<?php

namespace Database\Seeders;

use App\Enums\JobPostingStatus;
use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use App\Notifications\LikeReceivedNotification;
use App\Notifications\LikeResultNotification;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use Random\Engine\Mt19937;
use Random\Randomizer;

/**
 * デモ用のいいね(応募)・マッチ・ブックマーク・通知。DemoCompanySeederとDemoSeekerSeederのあとに実行する。
 *
 * - デモ用の求職者: 反応待ち2・マッチ1・見送り1・期限切れ1、ブックマーク3。今月のいいねは残り3回+スーパー1回(実際にいいねを試せる)
 * - デモ用の企業: 反応待ち4(1件は期限まで残り2日)・マッチ2(1件はデモ用の求職者)・見送り2・期限切れ1
 * - ほかの求職者: 一覧のいいね数や人気順に差が出るよう、ほかの会社の求人にいいねする(乱数は固定のため、毎回同じ結果になる)
 *
 * 日時はすべて実行した日から逆算し、反応待ちのいいねが期限切れにならないようにする。
 * デモ用の求職者のいいねがすでにあれば何もしない
 */
class DemoActivitySeeder extends Seeder
{
    /** 志望動機のひな形({company}・{title}を置き換える) */
    private const MOTIVATIONS = [
        '{company}の「{title}」に強く惹かれて応募しました。これまでの開発経験を活かしながら、ユーザーの声をもとにプロダクトを育てていく仕事に挑戦したいと考えています。',
        '求人を拝見し、チームで仕様から考えていく進め方に共感しました。前職でも企画の段階から関わってきたので、その経験を「{title}」で活かしたいです。',
        '{company}のサービスを実際に使ってみて、細かいところまで使いやすさが考えられていると感じました。自分もその一員として、使う人の役に立つ機能を作りたいです。',
        '技術スタックがこれまでの経験と近く、すぐに貢献できると考えて応募しました。あわせて、新しい技術にも積極的に取り組みたいと思っています。',
        'カジュアル面談で、まずはお話を伺えればうれしいです。{company}の事業の今後や、チームの働き方について詳しく知りたいです。',
    ];

    private Randomizer $random;

    public function run(): void
    {
        $demoSeeker = User::query()->where('email', DemoSeekerSeeder::EMAIL)->firstOrFail();

        if ($demoSeeker->likes()->exists()) {
            $this->command->info('デモ用のいいねは作成済みのため、何もしません。');

            return;
        }

        // 毎回同じデータになるよう、乱数の種を固定する
        $this->random = new Randomizer(new Mt19937(2026));
        $demoCompany = Company::query()->where('email', DemoCompanySeeder::EMAIL)->firstOrFail();
        $otherSeekers = User::query()->whereKeyNot($demoSeeker->id)->orderBy('id')->get();

        DB::transaction(function () use ($demoSeeker, $demoCompany, $otherSeekers) {
            $this->seedDemoSeeker($demoSeeker, $demoCompany);
            $this->seedDemoCompany($demoCompany, $otherSeekers);
            $this->seedOtherSeekers($demoCompany, $otherSeekers);
        });
    }

    /**
     * デモ用の求職者の応募(すべての状態)とブックマーク
     */
    private function seedDemoSeeker(User $seeker, Company $demoCompany): void
    {
        $jobs = $this->publishedJobsExcept($demoCompany);

        // 反応待ち(今月の通常いいね2回分。残りは3回+スーパー1回)
        $this->like($seeker, $jobs[0], LikeStatus::Applied, daysAgo: 1);
        $this->like($seeker, $jobs[5], LikeStatus::Applied, daysAgo: 4);
        // 結果が出たもの(先月のいいねにして、今月の残り回数に影響させない)
        $this->like($seeker, $demoCompany->jobPostings()->where('status', JobPostingStatus::Published)->orderBy('id')->firstOrFail(), LikeStatus::Matched, daysAgo: 40, likeType: LikeType::Super);
        $this->like($seeker, $jobs[9], LikeStatus::Declined, daysAgo: 45);
        $this->like($seeker, $jobs[13], LikeStatus::Expired, daysAgo: 55);
        // 結果の通知はどれも古く既読になるため、いちばん新しいもの(マッチ)だけ未読にして、ベルに件数が出るようにする
        $seeker->notifications()->latest()->firstOrFail()->forceFill(['read_at' => null])->save();

        // ブックマーク(いいね済みの求人・まだの求人・募集終了の求人)
        $closed = JobPosting::query()->where('status', JobPostingStatus::Closed)->firstOrFail();
        foreach ([$jobs[0], $jobs[17], $closed] as $index => $jobPosting) {
            $this->bookmark($seeker, $jobPosting, daysAgo: 10 - $index * 3);
        }
    }

    /**
     * デモ用の企業に届いた応募(すべての状態)。マッチのうち1件はデモ用の求職者(seedDemoSeekerで作成済み)
     *
     * @param  Collection<int, User>  $seekers
     */
    private function seedDemoCompany(Company $company, Collection $seekers): void
    {
        $jobs = $company->jobPostings()->whereIn('status', [JobPostingStatus::Published, JobPostingStatus::Closed])->orderBy('id')->get();
        $published = $jobs->where('status', JobPostingStatus::Published)->values();
        $closed = $jobs->firstWhere('status', JobPostingStatus::Closed);

        // 反応待ち。5日前のものは期限まで残り2日で、赤で表示される
        $this->like($seekers[0], $published[0], LikeStatus::Applied, daysAgo: 0);
        $this->like($seekers[1], $published[0], LikeStatus::Applied, daysAgo: 2, likeType: LikeType::Super);
        $this->like($seekers[2], $published[1], LikeStatus::Applied, daysAgo: 3);
        $this->like($seekers[3], $published[2], LikeStatus::Applied, daysAgo: 5);

        $this->like($seekers[4], $published[1], LikeStatus::Matched, daysAgo: 20);
        $this->like($seekers[5], $published[0], LikeStatus::Declined, daysAgo: 25);
        $this->like($seekers[6], $published[2], LikeStatus::Declined, daysAgo: 30);
        $this->like($seekers[7], $closed, LikeStatus::Expired, daysAgo: 80);
    }

    /**
     * ほかの求職者から、デモ用の企業以外の求人へのいいね。人気順やいいね数に差が出るよう、求人によって偏らせる
     *
     * @param  Collection<int, User>  $seekers
     */
    private function seedOtherSeekers(Company $demoCompany, Collection $seekers): void
    {
        $jobs = $this->publishedJobsExcept($demoCompany);

        foreach ($seekers as $seeker) {
            $alreadyLiked = $seeker->likes()->pluck('job_posting_id');
            // 一覧の前のほう(新しい求人)が選ばれやすいよう、候補を2回入れて重みを付ける
            $candidates = $jobs->whereNotIn('id', $alreadyLiked)->values();
            $weighted = $candidates->concat($candidates->take(12))->all();
            $picked = collect($this->random->shuffleArray($weighted))->unique('id')->take($this->random->getInt(2, 4));

            foreach ($picked->values() as $index => $jobPosting) {
                // 今月のいいねは1人3回まで(上限5回を超えないようにする)。最初の1件だけ反応待ち、残りは結果が出たもの
                if ($index === 0) {
                    $this->like($seeker, $jobPosting, LikeStatus::Applied, daysAgo: $this->random->getInt(0, 6));

                    continue;
                }

                $status = [LikeStatus::Matched, LikeStatus::Declined, LikeStatus::Declined, LikeStatus::Expired][$this->random->getInt(0, 3)];
                $this->like($seeker, $jobPosting, $status, daysAgo: $this->random->getInt(8, 50));
            }

            if ($this->random->getInt(0, 1) === 1) {
                $this->bookmark($seeker, $candidates[$this->random->getInt(0, $candidates->count() - 1)], daysAgo: $this->random->getInt(1, 30));
            }
        }
    }

    /**
     * いいねを作り、画面から操作したときと同じ通知も送る(企業へは届いた通知、求職者へは結果の通知)。
     * 通知の日時もいいね・返事の日時に合わせ、古い通知は既読にする
     */
    private function like(User $seeker, JobPosting $jobPosting, LikeStatus $status, int $daysAgo, LikeType $likeType = LikeType::Standard): void
    {
        $createdAt = CarbonImmutable::now()->subDays($daysAgo)->subHours($this->random->getInt(1, 10));
        $deadline = $createdAt->addDays(Like::RESPONSE_DAYS);
        $respondedAt = match ($status) {
            LikeStatus::Matched, LikeStatus::Declined => $createdAt->addDays($this->random->getInt(1, 5)),
            default => null,
        };

        $like = new Like([
            'like_type' => $likeType,
            'motivation' => strtr(self::MOTIVATIONS[$this->random->getInt(0, count(self::MOTIVATIONS) - 1)], [
                '{company}' => $jobPosting->company->name,
                '{title}' => $jobPosting->title,
            ]),
            'status' => $status,
            'response_deadline' => $deadline,
            'responded_at' => $respondedAt,
        ]);
        $like->user()->associate($seeker);
        $like->jobPosting()->associate($jobPosting);
        $like->created_at = $createdAt;
        $like->updated_at = $respondedAt ?? ($status === LikeStatus::Expired ? $deadline : $createdAt);
        $like->save();

        $this->notifyAt($jobPosting->company, new LikeReceivedNotification($like), $createdAt);

        $resultAt = $status === LikeStatus::Expired ? $deadline : $respondedAt;
        if ($resultAt !== null) {
            $this->notifyAt($seeker, new LikeResultNotification($like), $resultAt);
        }
    }

    /**
     * 通知を送り、その日時に届いたことにする。2日以上前の通知は既読にする(未読と既読を混ぜる)
     */
    private function notifyAt(User|Company $notifiable, Notification $notification, CarbonImmutable $at): void
    {
        $notifiable->notify($notification);

        $notifiable->notifications()->latest()->firstOrFail()->forceFill([
            'created_at' => $at,
            'updated_at' => $at,
            'read_at' => $at->lt(now()->subDays(2)) ? $at->addHours(3) : null,
        ])->save();
    }

    private function bookmark(User $seeker, JobPosting $jobPosting, int $daysAgo): void
    {
        $seeker->bookmarks()->make()->forceFill([
            'job_posting_id' => $jobPosting->id,
            'created_at' => now()->subDays($daysAgo),
        ])->save();
    }

    /**
     * デモ用の企業以外の、公開中の求人(新しい順)
     *
     * @return Collection<int, JobPosting>
     */
    private function publishedJobsExcept(Company $company): Collection
    {
        return JobPosting::query()
            ->where('status', JobPostingStatus::Published)
            ->whereKeyNot($company->jobPostings()->pluck('id'))
            ->with('company:id,name')
            ->orderByDesc('published_at')
            ->get();
    }
}
