<?php

namespace App\Http\Controllers\Seeker;

use App\Enums\JobPostingStatus;
use App\Enums\LikeType;
use App\Http\Controllers\Controller;
use App\Http\Resources\LikeResource;
use App\Models\JobPosting;
use App\Models\User;
use App\Services\LikeSender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * 求職者のいいね(=応募)
 */
class LikeController extends Controller
{
    /**
     * 求人にいいねする(志望動機を添えて応募する)
     */
    public function store(Request $request, JobPosting $jobPosting, LikeSender $sender): JsonResponse
    {
        // 下書きは公開APIと同じく、存在しないものとして扱う
        abort_if($jobPosting->status === JobPostingStatus::Draft, 404);

        $validated = $request->validate([
            'like_type' => ['required', Rule::enum(LikeType::class)],
            // 志望動機の文字数は制限しない(DB設計どおり)
            'motivation' => ['required', 'string'],
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
