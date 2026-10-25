<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyImageResource;
use App\Models\Company;
use App\Models\CompanyImage;
use App\Services\ImageStorage;
use App\Services\NextRevalidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/**
 * 企業ページの写真ギャラリー。1枚ずつ追加・削除する(一覧は企業ページ取得APIに含まれる)。
 * 並び替えはしない(登録順に表示)
 */
class CompanyImageController extends Controller
{
    /** 1社あたりの写真の上限 */
    private const MAX_IMAGES = 5;

    /** 保存する写真の最大サイズ(px)。企業ページで大きく表示しても粗くならない大きさ */
    private const MAX_WIDTH = 1600;

    private const MAX_HEIGHT = 1200;

    /**
     * 写真を1枚追加する
     *
     * @throws ValidationException
     */
    public function store(Request $request, ImageStorage $images, NextRevalidator $revalidator): JsonResponse
    {
        $request->validate(
            ['image' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120']],
            attributes: ['image' => '写真'],
        );

        /** @var Company $company */
        $company = $request->user('company');

        // 枚数の上限はDBの制約ではなく、ここで確認する
        if ($company->images()->count() >= self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'image' => 'ギャラリーの写真は'.self::MAX_IMAGES.'枚までです。',
            ]);
        }

        $companyImage = $company->images()->create([
            'path' => $images->storeResized($request->file('image'), 'company-images', self::MAX_WIDTH, self::MAX_HEIGHT),
        ]);

        $revalidator->companyChanged($company);

        return (new CompanyImageResource($companyImage))->response()->setStatusCode(201);
    }

    /**
     * 写真を1枚削除する
     */
    public function destroy(CompanyImage $companyImage, ImageStorage $images, NextRevalidator $revalidator): Response
    {
        Gate::authorize('delete', $companyImage);

        $companyImage->delete();
        $images->delete($companyImage->path);

        $revalidator->companyChanged($companyImage->company);

        return response()->noContent();
    }
}
