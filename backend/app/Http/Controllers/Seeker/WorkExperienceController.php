<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seeker\WorkExperienceRequest;
use App\Http\Resources\WorkExperienceResource;
use App\Models\User;
use App\Models\WorkExperience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * 求職者の職歴の追加・編集・削除(一覧はプロフィール取得APIに含まれる)
 */
class WorkExperienceController extends Controller
{
    public function store(WorkExperienceRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        // user_idはリクエストから受け取らず、ログイン中の求職者から作る
        $workExperience = $user->workExperiences()->create($request->attributesForModel());

        return (new WorkExperienceResource($workExperience))->response()->setStatusCode(201);
    }

    public function update(WorkExperienceRequest $request, WorkExperience $workExperience): WorkExperienceResource
    {
        Gate::authorize('update', $workExperience);

        $workExperience->update($request->attributesForModel());

        return new WorkExperienceResource($workExperience);
    }

    public function destroy(WorkExperience $workExperience): Response
    {
        Gate::authorize('delete', $workExperience);

        $workExperience->delete();

        return response()->noContent();
    }
}
