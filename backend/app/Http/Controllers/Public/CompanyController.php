<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicCompanyResource;
use App\Models\Company;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 求職者向けの企業ページ(ログイン不要)
 */
class CompanyController extends Controller
{
    /**
     * 企業ページの全項目と、技術スタック・働き方・ギャラリー・募集中の求人を返す。
     * 会員登録直後(会社名だけ)の企業も表示する(企業が自社ページの見え方を確認するプレビューとしても使うため)
     */
    public function show(Company $company): PublicCompanyResource
    {
        $company->load([
            'techStacks' => fn ($query) => $query->orderBy('sort_order'),
            'workStyles' => fn ($query) => $query->orderBy('sort_order'),
            'images' => fn ($query) => $query->orderBy('id'),
            // 募集中の求人は公開中だけを新着順で。カードの表示に必要なものもまとめて読み込む(N+1を避ける)
            'jobPostings' => fn (HasMany $query) => $query
                ->published()
                ->with([
                    'jobCategories' => fn ($query) => $query->orderBy('sort_order'),
                    'techStacks' => fn ($query) => $query->orderBy('sort_order'),
                    'images' => fn ($query) => $query->orderBy('id')->limit(1),
                ])
                ->withCount('likes')
                ->orderByDesc('published_at')
                ->orderByDesc('id'),
        ]);

        return new PublicCompanyResource($company);
    }
}
