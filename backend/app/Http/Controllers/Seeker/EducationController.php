<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Resources\EducationResource;
use App\Models\Education;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/**
 * 求職者の学歴の追加・編集・削除(一覧はプロフィール取得APIに含まれる)。
 * 項目が学校名だけの単純な検証のため、FormRequestは使わずここで検証する
 */
class EducationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        $education = $user->educations()->create($this->validateEducation($request));

        return (new EducationResource($education))->response()->setStatusCode(201);
    }

    public function update(Request $request, Education $education): EducationResource
    {
        Gate::authorize('update', $education);

        $education->update($this->validateEducation($request));

        return new EducationResource($education);
    }

    public function destroy(Education $education): Response
    {
        Gate::authorize('delete', $education);

        $education->delete();

        return response()->noContent();
    }

    /**
     * @return array{school_name: string}
     */
    private function validateEducation(Request $request): array
    {
        return $request->validate([
            'school_name' => ['required', 'string', 'max:255'],
        ]);
    }
}
