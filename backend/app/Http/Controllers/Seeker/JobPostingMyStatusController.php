<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\JobPostingStatus;
use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 求人に対する自分の状況(求人詳細のいいね・ブックマークのボタン用)。
 * 求人詳細のAPIは全員で同じキャッシュを使うため、本人ごとの情報はこちらで別に返す
 */
class JobPostingMyStatusController extends Controller
{
    public function show(Request $request, JobPosting $jobPosting): JsonResponse
    {
        abort_if($jobPosting->status === JobPostingStatus::Draft, 404);

        /** @var User $user */
        $user = $request->user('web');

        $latestLike = $user->likes()
            ->where('job_posting_id', $jobPosting->id)
            ->latest()
            ->latest('id')
            ->first();

        return response()->json([
            'data' => [
                'bookmarked' => $user->bookmarks()->where('job_posting_id', $jobPosting->id)->exists(),
                // いいねしていなければnull。期限切れなら、もう一度いいねできる
                'like' => $latestLike === null ? null : [
                    'id' => $latestLike->id,
                    'status' => [
                        'value' => $latestLike->status->value,
                        'label' => $latestLike->status->label(),
                    ],
                ],
            ],
        ]);
    }
}
