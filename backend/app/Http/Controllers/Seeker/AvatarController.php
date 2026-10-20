<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ImageStorage;
use Illuminate\Http\Request;

/**
 * 求職者のアイコン画像
 */
class AvatarController extends Controller
{
    /** 保存するアイコンの一辺の長さ(px) */
    private const SIZE = 400;

    /**
     * アイコンを登録・差し替える。差し替えた場合、古い画像は削除する
     */
    public function store(Request $request, ImageStorage $images): UserResource
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);

        /** @var User $user */
        $user = $request->user('web');
        $oldPath = $user->avatar_path;

        $user->update([
            'avatar_path' => $images->storeSquare($request->file('avatar'), 'avatars/users', self::SIZE),
        ]);

        // 新しい画像の保存に成功してから、古い画像を消す
        $images->delete($oldPath);

        return new UserResource($user);
    }

    /**
     * アイコンを削除する
     */
    public function destroy(Request $request, ImageStorage $images): UserResource
    {
        /** @var User $user */
        $user = $request->user('web');

        $images->delete($user->avatar_path);
        $user->update(['avatar_path' => null]);

        return new UserResource($user);
    }
}
