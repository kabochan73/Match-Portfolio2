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

        return new UserResource($user->loadProfile());
    }

    /**
     * 基本情報を更新する。メールアドレス・パスワードはここでは変更できない
     */
    public function update(Request $request): UserResource
    {
        /** @var User $user */
        $user = $request->user('web');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'birth_date' => User::birthDateRules(),
            'comment' => ['nullable', 'string', 'max:200'],
            'portfolio_url' => ['nullable', 'string', 'url', 'max:255'],
        ]);

        $user->update($validated);

        return new UserResource($user);
    }
}
