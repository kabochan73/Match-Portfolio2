<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * 求職者のプロフィール(マイページ)
 */
class ProfileController extends Controller
{
    /**
     * 基本情報と職歴・学歴・資格をまとめて返す
     */
    public function show(Request $request): UserResource
    {
        /** @var User $user */
        $user = $request->user('web');

        // N+1を避けるため、関連データはまとめて読み込む
        $user->load([
            // 職歴は新しい順(在籍開始年月の降順)
            'workExperiences' => fn ($query) => $query->orderByDesc('started_on')->orderByDesc('id'),
            // 学歴・資格は登録順
            'educations' => fn ($query) => $query->orderBy('id'),
            'certifications' => fn ($query) => $query->orderBy('id'),
        ]);

        return new UserResource($user);
    }
}
