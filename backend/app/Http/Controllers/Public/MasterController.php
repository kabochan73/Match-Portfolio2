<?php

namespace App\Http\Controllers\Public;

use App\Enums\EmploymentType;
use App\Enums\Prefecture;
use App\Http\Controllers\Controller;
use App\Http\Resources\JobCategoryResource;
use App\Http\Resources\TechStackResource;
use App\Http\Resources\WorkStyleResource;
use App\Models\JobCategory;
use App\Models\TechStack;
use App\Models\WorkStyle;
use Illuminate\Http\JsonResponse;

/**
 * 検索サイドバーや入力フォームの選択肢(ログイン不要)。
 * 滅多に変わらないデータのため1回の取得でまとめて返し、フロントで長時間キャッシュする。
 * enum(都道府県・雇用形態)もここから返し、フロントに選択肢を二重に持たないようにする
 */
class MasterController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'job_categories' => JobCategoryResource::collection(JobCategory::query()->orderBy('sort_order')->get()),
                'tech_stacks' => TechStackResource::collection(TechStack::query()->orderBy('sort_order')->get()),
                'work_styles' => WorkStyleResource::collection(WorkStyle::query()->orderBy('sort_order')->get()),
                'prefectures' => $this->enumOptions(Prefecture::cases()),
                'employment_types' => $this->enumOptions(EmploymentType::cases()),
            ],
        ]);
    }

    /**
     * enumを{value, label}の配列にする(定義順)
     *
     * @param  list<Prefecture|EmploymentType>  $cases
     * @return list<array{value: string, label: string}>
     */
    private function enumOptions(array $cases): array
    {
        return array_map(
            fn (Prefecture|EmploymentType $case) => ['value' => $case->value, 'label' => $case->label()],
            $cases,
        );
    }
}
