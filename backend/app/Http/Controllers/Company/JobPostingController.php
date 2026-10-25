<?php

namespace App\Http\Controllers\Company;

use App\Enums\JobPostingStatus;
use App\Enums\LikeStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\JobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\Company;
use App\Models\JobPosting;
use App\Services\ImageStorage;
use App\Services\NextRevalidator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/**
 * 企業による自社の求人の管理
 */
class JobPostingController extends Controller
{
    /** PostgreSQLの外部キー制約違反のエラーコード */
    private const FOREIGN_KEY_VIOLATION = '23503';

    /**
     * 自社の求人一覧(すべての状態)。更新日時の新しい順。カードで見せるため、技術スタックとカバー画像も含める。
     * metaに公開中の件数と上限を含める(求人管理画面の「公開中 3 / 10件」の表示に使う)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var Company $company */
        $company = $request->user('company');

        $jobPostings = $company->jobPostings()
            ->with([
                'jobCategories' => fn ($query) => $query->orderBy('sort_order'),
                'techStacks' => fn ($query) => $query->orderBy('sort_order'),
                'coverImage',
            ])
            ->withCount($this->likeCounts())
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        return JobPostingResource::collection($jobPostings)->additional([
            'meta' => [
                'published_count' => $jobPostings->where('status', JobPostingStatus::Published)->count(),
                'max_published' => JobPosting::MAX_PUBLISHED_PER_COMPANY,
            ],
        ]);
    }

    /**
     * 自社の求人の詳細(編集画面・管理画面用)
     */
    public function show(JobPosting $jobPosting): JobPostingResource
    {
        Gate::authorize('view', $jobPosting);

        $jobPosting
            ->load([
                'jobCategories' => fn ($query) => $query->orderBy('sort_order'),
                'techStacks' => fn ($query) => $query->orderBy('sort_order'),
                'images' => fn ($query) => $query->orderBy('id'),
            ])
            ->loadCount($this->likeCounts());

        return new JobPostingResource($jobPosting);
    }

    /**
     * 求人を作成する。状態は必ず下書きで作り、公開は「公開」の操作でのみ行う(公開中件数の上限チェックを1か所に集めるため)
     */
    public function store(JobPostingRequest $request): JsonResponse
    {
        /** @var Company $company */
        $company = $request->user('company');

        $jobPosting = DB::transaction(function () use ($request, $company) {
            $jobPosting = $company->jobPostings()->create([
                ...$request->jobPostingAttributes(),
                'status' => JobPostingStatus::Draft,
            ]);
            $this->syncTags($jobPosting, $request);

            return $jobPosting;
        });

        return $this->show($jobPosting)->response()->setStatusCode(201);
    }

    /**
     * 求人を編集する(公開中の求人も編集できる)
     */
    public function update(JobPostingRequest $request, JobPosting $jobPosting, NextRevalidator $revalidator): JobPostingResource
    {
        Gate::authorize('update', $jobPosting);

        DB::transaction(function () use ($request, $jobPosting) {
            $jobPosting->update($request->jobPostingAttributes());
            $this->syncTags($jobPosting, $request);
        });

        $revalidator->jobPostingChanged($jobPosting);

        return $this->show($jobPosting);
    }

    /**
     * 求人を削除する。いいねが1件でもある求人は、応募履歴を守るため削除できない(募集終了を案内する)
     *
     * @throws ValidationException
     */
    public function destroy(JobPosting $jobPosting, ImageStorage $images, NextRevalidator $revalidator): Response
    {
        Gate::authorize('delete', $jobPosting);

        if ($jobPosting->likes()->exists()) {
            $this->failToDeleteLikedPosting();
        }

        // 画像のレコードはDBのcascadeで消えるため、ファイルのパスを先に控えておく
        $imagePaths = $jobPosting->images()->pluck('path');

        try {
            // PostgreSQLはトランザクション内でエラーが起きると以降の処理を受け付けなくなるため、
            // 削除だけをトランザクションで囲み、失敗したらそこまでを巻き戻す
            DB::transaction(fn () => $jobPosting->delete());
        } catch (QueryException $e) {
            // 確認の直後にいいねが入った場合、likes.job_posting_idの外部キー(restrict)が削除を止める。
            // 500エラーにせず、上と同じ理由を返す(23503: 外部キー制約違反)
            if ($e->getCode() !== self::FOREIGN_KEY_VIOLATION) {
                throw $e;
            }

            $this->failToDeleteLikedPosting();
        }

        // DBから削除できた後に、ストレージの画像ファイルを消す
        $imagePaths->each(fn (string $path) => $images->delete($path));

        // 削除した求人は一覧・企業ページからも消える
        $revalidator->jobPostingChanged($jobPosting, listChanged: true);

        return response()->noContent();
    }

    /**
     * 職種・技術スタックを、送られたIDの状態にそろえる(外したものは削除、新しいものは追加)
     */
    private function syncTags(JobPosting $jobPosting, JobPostingRequest $request): void
    {
        $jobPosting->jobCategories()->sync($request->validated('job_category_ids'));
        $jobPosting->techStacks()->sync($request->validated('tech_stack_ids'));
    }

    /**
     * @throws ValidationException
     */
    private function failToDeleteLikedPosting(): never
    {
        throw ValidationException::withMessages([
            'job_posting' => 'いいねがある求人は削除できません。募集終了にしてください。',
        ]);
    }

    /**
     * いいね数(累計)と、企業の反応待ちの件数。SQLでまとめて数え、求人ごとの問い合わせ(N+1)を避ける
     *
     * @return array<int|string, mixed>
     */
    private function likeCounts(): array
    {
        return [
            'likes',
            'likes as pending_likes_count' => fn (Builder $query) => $query->where('status', LikeStatus::Applied),
        ];
    }
}
