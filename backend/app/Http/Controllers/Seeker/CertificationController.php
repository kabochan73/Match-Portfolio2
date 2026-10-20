<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seeker\CertificationRequest;
use App\Http\Resources\CertificationResource;
use App\Models\Certification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * 求職者の資格の追加・編集・削除(一覧はプロフィール取得APIに含まれる)
 */
class CertificationController extends Controller
{
    public function store(CertificationRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $certification = $user->certifications()->create($request->validated());

        return (new CertificationResource($certification))->response()->setStatusCode(201);
    }

    public function update(CertificationRequest $request, Certification $certification): CertificationResource
    {
        Gate::authorize('update', $certification);

        $certification->update($request->validated());

        return new CertificationResource($certification);
    }

    public function destroy(Certification $certification): Response
    {
        Gate::authorize('delete', $certification);

        $certification->delete();

        return response()->noContent();
    }
}
