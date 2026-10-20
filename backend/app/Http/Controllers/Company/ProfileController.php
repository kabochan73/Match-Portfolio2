<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\Request;

/**
 * 企業ページ(企業本人による閲覧・編集)
 */
class ProfileController extends Controller
{
    /**
     * 企業ページの全項目と、技術スタック・働き方・ギャラリーをまとめて返す
     */
    public function show(Request $request): CompanyResource
    {
        /** @var Company $company */
        $company = $request->user('company');

        // N+1を避けるため、関連データはまとめて読み込む
        $company->load([
            // 技術スタック・働き方はマスタの表示順
            'techStacks' => fn ($query) => $query->orderBy('sort_order'),
            'workStyles' => fn ($query) => $query->orderBy('sort_order'),
            // ギャラリーは登録順
            'images' => fn ($query) => $query->orderBy('id'),
        ]);

        return new CompanyResource($company);
    }
}
