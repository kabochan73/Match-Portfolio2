<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\JobSearchRequest;
use App\Http\Resources\JobPostingSummaryResource;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * 求職者向けの求人(ログイン不要)
 */
class JobPostingController extends Controller
{
    /** 1回に返す件数(1〜4列のどれでも割り切れるため24件) */
    private const PER_PAGE = 24;

    /** 人気順で数えるいいねの期間(NEWラベルと揃えている) */
    private const POPULAR_DAYS = 30;

    /**
     * 公開中の求人を検索する。異なる条件同士はANDで絞り込む
     */
    public function index(JobSearchRequest $request): AnonymousResourceCollection
    {
        $query = JobPosting::query()
            ->published()
            // 求人カードの表示に必要なものをまとめて読み込み、求人ごとの問い合わせ(N+1)を避ける
            ->with([
                'company:id,name,avatar_path',
                'jobCategories' => fn ($query) => $query->orderBy('sort_order'),
                'techStacks' => fn ($query) => $query->orderBy('sort_order'),
                // カバー画像は1枚目だけでよいため、求人ごとに1件に絞って読み込む
                'images' => fn ($query) => $query->orderBy('id')->limit(1),
            ])
            ->withCount('likes');

        // 職種・技術スタックは、選んだものをすべて持つ求人(AND)
        foreach ($request->validated('job_category_ids') ?? [] as $jobCategoryId) {
            $query->whereHas('jobCategories', fn (Builder $query) => $query->whereKey($jobCategoryId));
        }

        foreach ($request->validated('tech_stack_ids') ?? [] as $techStackId) {
            $query->whereHas('techStacks', fn (Builder $query) => $query->whereKey($techStackId));
        }

        if ($request->filled('prefecture')) {
            $query->where('prefecture', $request->validated('prefecture'));
        }

        // 雇用形態は1つの求人が1つしか持たないため、選んだもののどれか(OR)
        if ($request->filled('employment_types')) {
            $query->whereIn('employment_type', $request->validated('employment_types'));
        }

        // 各単語を、タイトルか仕事内容のどちらかに含む求人(単語同士はAND)
        foreach ($request->keywords() as $keyword) {
            $pattern = '%'.$this->escapeLike($keyword).'%';

            $query->where(fn (Builder $query) => $query
                ->whereLike('title', $pattern)
                ->orWhereLike('description', $pattern));
        }

        if ($request->sort() === JobSearchRequest::SORT_POPULAR) {
            // 累計ではなく直近のいいね数で並べ、古い求人が上に居座らないようにする
            $query
                ->withCount(['likes as recent_likes_count' => fn (Builder $query) => $query
                    ->where('created_at', '>=', now()->subDays(self::POPULAR_DAYS))])
                ->orderByDesc('recent_likes_count');
        }

        // 新着順(人気順で同数の場合も新着順)。募集再開ではpublished_atが変わらないため、上には戻らない
        $query->orderByDesc('published_at')->orderByDesc('id');

        return JobPostingSummaryResource::collection($query->paginate(self::PER_PAGE));
    }

    /**
     * LIKE検索で特別な意味を持つ記号(%と_)を、ただの文字として扱うようにする
     */
    private function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }
}
