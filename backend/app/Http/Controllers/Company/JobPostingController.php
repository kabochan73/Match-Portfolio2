<?php

namespace App\Http\Controllers\Company;

use App\Enums\JobPostingStatus;
use App\Enums\LikeStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\JobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\Company;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * 企業による自社の求人の管理
 */
class JobPostingController extends Controller
{
    /**
     * 自社の求人一覧(すべての状態)。更新日時の新しい順。
     * metaに公開中の件数と上限を含める(求人管理画面の「公開中 3 / 10件」の表示に使う)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var Company $company */
        $company = $request->user('company');

        $jobPostings = $company->jobPostings()
            ->with(['jobCategories' => fn ($query) => $query->orderBy('sort_order')])
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
    public function update(JobPostingRequest $request, JobPosting $jobPosting): JobPostingResource
    {
        Gate::authorize('update', $jobPosting);

        DB::transaction(function () use ($request, $jobPosting) {
            $jobPosting->update($request->jobPostingAttributes());
            $this->syncTags($jobPosting, $request);
        });

        return $this->show($jobPosting);
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
