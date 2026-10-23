<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\JobPostingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookmarkResource;
use App\Models\Bookmark;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * 求職者の求人ブックマーク(件数上限なし、企業には見せない)
 */
class BookmarkController extends Controller
{
    private const PER_PAGE = 20;

    /**
     * ブックマーク一覧(ブックマークした新しい順)。募集終了した求人も残し、応募状況のバッジ用に最新のいいねを添える
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user('web');

        $bookmarks = $user->bookmarks()
            ->with(['jobPosting' => fn ($query) => $query->withCardData()])
            ->latest()
            ->latest('id')
            ->paginate(self::PER_PAGE);

        // このページの求人への自分のいいねを1回で取り、求人ごとに最新の1件だけを残す
        $latestLikes = $user->likes()
            ->whereIn('job_posting_id', $bookmarks->pluck('job_posting_id'))
            ->latest()
            ->latest('id')
            ->get()
            ->unique('job_posting_id')
            ->keyBy('job_posting_id');

        $bookmarks->each(fn (Bookmark $bookmark) => $bookmark->setRelation(
            'latestLike',
            $latestLikes->get($bookmark->job_posting_id),
        ));

        return BookmarkResource::collection($bookmarks);
    }

    /**
     * ブックマークを付ける。すでに付いていても成功扱い(二度押しでエラーにしない)
     */
    public function store(Request $request, JobPosting $jobPosting): Response
    {
        abort_if($jobPosting->status === JobPostingStatus::Draft, 404);

        if ($jobPosting->status !== JobPostingStatus::Published) {
            throw ValidationException::withMessages(['job_posting' => 'この求人は募集を終了しています。']);
        }

        /** @var User $user */
        $user = $request->user('web');

        // ほぼ同時に2回届いても、2件目はユニーク制約で無視される
        Bookmark::query()->insertOrIgnore([
            'user_id' => $user->id,
            'job_posting_id' => $jobPosting->id,
            'created_at' => now(),
        ]);

        return response()->noContent();
    }

    /**
     * ブックマークを外す。付いていなくても成功扱い
     */
    public function destroy(Request $request, JobPosting $jobPosting): Response
    {
        /** @var User $user */
        $user = $request->user('web');

        $user->bookmarks()->where('job_posting_id', $jobPosting->id)->delete();

        return response()->noContent();
    }
}
