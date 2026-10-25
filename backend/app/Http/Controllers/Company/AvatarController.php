<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use App\Services\ImageStorage;
use App\Services\NextRevalidator;
use Illuminate\Http\Request;

/**
 * 企業のロゴ画像
 */
class AvatarController extends Controller
{
    /** 保存するロゴの一辺の長さ(px) */
    private const SIZE = 400;

    /**
     * ロゴを登録・差し替える。差し替えた場合、古い画像は削除する
     */
    public function store(Request $request, ImageStorage $images, NextRevalidator $revalidator): CompanyResource
    {
        $request->validate(
            ['avatar' => ImageStorage::UPLOAD_RULES],
            attributes: ['avatar' => 'ロゴ画像'],
        );

        /** @var Company $company */
        $company = $request->user('company');
        $oldPath = $company->avatar_path;

        $company->update([
            'avatar_path' => $images->storeSquare($request->file('avatar'), 'avatars/companies', self::SIZE),
        ]);

        // 新しい画像の保存に成功してから、古い画像を消す
        $images->delete($oldPath);

        $revalidator->companyChanged($company);

        return new CompanyResource($company);
    }

    /**
     * ロゴを削除する
     */
    public function destroy(Request $request, ImageStorage $images, NextRevalidator $revalidator): CompanyResource
    {
        /** @var Company $company */
        $company = $request->user('company');

        $images->delete($company->avatar_path);
        $company->update(['avatar_path' => null]);

        $revalidator->companyChanged($company);

        return new CompanyResource($company);
    }
}
