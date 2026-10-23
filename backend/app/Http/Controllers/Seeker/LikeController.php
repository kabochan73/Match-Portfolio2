<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\JobPostingStatus;
use App\Enums\LikeTab;
use App\Enums\LikeType;
use App\Http\Controllers\Controller;
use App\Http\Resources\LikeResource;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use App\Services\LikeSender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * 求職者のいいね(=応募)
 */
class LikeController extends Controller
{
    /** 応募状況の1ページの件数(いいねは月6回までなので、それほど増えない) */
    private const PER_PAGE = 20;

    /**
     * 応募状況(タブごと・新しい順)。各タブの件数もmetaに含め、タブの横に表示できるようにする
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::enum(LikeTab::class)],
        ]);
        $tab = LikeTab::tryFrom($validated['status'] ?? '') ?? LikeTab::Applied;

        /** @var User $user */
        $user = $request->user('web');

        $likes = $user->likes()
            ->whereIn('status', $tab->statuses())
            ->with(['jobPosting' => fn ($query) => $query->withCardData()])
            ->latest()
            ->latest('id')
            ->paginate(self::PER_PAGE);

        return LikeResource::collection($likes)->additional([
            'meta' => ['counts' => LikeTab::counts($user->likes())],
        ]);
    }

    /**
     * 応募の詳細(自分のいいねだけ)
     */
    public function show(Like $like): LikeResource
    {
        Gate::authorize('view', $like);

        return new LikeResource($like->load(['jobPosting' => fn ($query) => $query->withCardData()]));
    }

    /**
     * 求人にいいねする(志望動機を添えて応募する)
     */
    public function store(Request $request, JobPosting $jobPosting, LikeSender $sender): JsonResponse
    {
        // 下書きは公開APIと同じく、存在しないものとして扱う
        abort_if($jobPosting->status === JobPostingStatus::Draft, 404);

        $validated = $request->validate([
            'like_type' => ['required', Rule::enum(LikeType::class)],
            // 企業が読む文章のため、極端に長い文章は受け付けない
            'motivation' => ['required', 'string', 'max:2000'],
        ]);

        /** @var User $user */
        $user = $request->user('web');

        $like = $sender->send(
            $user,
            $jobPosting,
            LikeType::from($validated['like_type']),
            $validated['motivation'],
        );

        return (new LikeResource($like))->response()->setStatusCode(201);
    }
}
