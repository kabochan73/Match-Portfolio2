<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostingImageResource;
use App\Models\JobPosting;
use App\Models\JobPostingImage;
use App\Services\ImageStorage;
use App\Services\NextRevalidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/**
 * 求人票の画像ギャラリー。1枚ずつ追加・削除する(一覧は求人詳細に含まれる)。
 * 並び替えはしない(登録順に表示し、1枚目が求人カードのカバー画像になる)
 */
class JobPostingImageController extends Controller
{
    /** 1求人あたりの画像の上限 */
    private const MAX_IMAGES = 5;

    /** 保存する画像の最大サイズ(px) */
    private const MAX_WIDTH = 1600;

    private const MAX_HEIGHT = 1200;

    /**
     * 画像を1枚追加する。どの状態(下書き・公開中・募集終了)でも追加できる
     *
     * @throws ValidationException
     */
    public function store(Request $request, JobPosting $jobPosting, ImageStorage $images, NextRevalidator $revalidator): JsonResponse
    {
        Gate::authorize('update', $jobPosting);

        $request->validate(
            ['image' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120']],
            attributes: ['image' => '画像'],
        );

        // 枚数の上限はDBの制約ではなく、ここで確認する(画像を保存する前に確認し、不要なファイルを残さない)
        if ($jobPosting->images()->count() >= self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'image' => '求人の画像は'.self::MAX_IMAGES.'枚までです。',
            ]);
        }

        $jobPostingImage = $jobPosting->images()->create([
            'path' => $images->storeResized($request->file('image'), 'job-posting-images', self::MAX_WIDTH, self::MAX_HEIGHT),
        ]);

        $revalidator->jobPostingChanged($jobPosting);

        return (new JobPostingImageResource($jobPostingImage))->response()->setStatusCode(201);
    }

    /**
     * 画像を1枚削除する。URLの求人に属していない画像IDは、スコープ付きバインディングにより404になる
     */
    public function destroy(JobPosting $jobPosting, JobPostingImage $image, ImageStorage $images, NextRevalidator $revalidator): Response
    {
        Gate::authorize('update', $jobPosting);

        $image->delete();
        $images->delete($image->path);

        $revalidator->jobPostingChanged($jobPosting);

        return response()->noContent();
    }
}
