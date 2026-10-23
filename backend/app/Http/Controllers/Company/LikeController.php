<?php

namespace App\Http\Controllers\Company;

use App\Enums\LikeTab;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReceivedLikeResource;
use App\Models\Company;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * 企業が受け取ったいいね(応募者)の一覧・詳細
 */
class LikeController extends Controller
{
    private const PER_PAGE = 20;

    /**
     * 応募者一覧(タブごと、求人で絞り込み可)。各タブの件数もmetaに含める
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var Company $company */
        $company = $request->user('company');

        $validated = $request->validate([
            'status' => ['nullable', Rule::enum(LikeTab::class)],
            // 自社の求人だけで絞り込める
            'job_posting_id' => ['nullable', 'integer', Rule::exists('job_postings', 'id')->where('company_id', $company->id)],
        ]);
        $tab = LikeTab::tryFrom($validated['status'] ?? '') ?? LikeTab::Applied;

        $received = Like::query()
            ->whereIn('job_posting_id', $company->jobPostings()->select('id'))
            ->when(
                $validated['job_posting_id'] ?? null,
                fn ($query, int $jobPostingId) => $query->where('job_posting_id', $jobPostingId),
            );

        $likes = $received->clone()
            ->whereIn('status', $tab->statuses())
            ->with(['user', 'jobPosting:id,title'])
            // 反応待ちは期限が近い順(返事を忘れて期限切れにしないため)。それ以外は新しい順
            ->when(
                $tab === LikeTab::Applied,
                fn ($query) => $query->orderBy('response_deadline')->orderBy('id'),
                fn ($query) => $query->latest()->latest('id'),
            )
            ->paginate(self::PER_PAGE);

        return ReceivedLikeResource::collection($likes)->additional([
            'meta' => ['counts' => LikeTab::counts($received)],
        ]);
    }

    /**
     * 応募者の詳細(プロフィール全体と志望動機)
     */
    public function show(Like $like): ReceivedLikeResource
    {
        Gate::authorize('view', $like);

        $like->load('jobPosting:id,title,company_id');
        $like->user->loadProfile();

        return new ReceivedLikeResource($like);
    }
}
