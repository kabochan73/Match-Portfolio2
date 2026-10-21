<?php

namespace App\Http\Requests\Public;

use App\Enums\EmploymentType;
use App\Enums\Prefecture;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 求人検索の条件(クエリパラメータ)。すべて任意
 */
class JobSearchRequest extends FormRequest
{
    public const SORT_NEW = 'new';

    public const SORT_POPULAR = 'popular';

    /**
     * ログイン不要の公開APIのため、常に許可する
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_category_ids' => ['nullable', 'array'],
            'job_category_ids.*' => ['integer'],
            'tech_stack_ids' => ['nullable', 'array'],
            'tech_stack_ids.*' => ['integer'],
            'prefecture' => ['nullable', Rule::enum(Prefecture::class)],
            'employment_types' => ['nullable', 'array'],
            'employment_types.*' => [Rule::enum(EmploymentType::class)],
            'keyword' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in([self::SORT_NEW, self::SORT_POPULAR])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * キーワードを空白(全角スペースを含む)で区切った単語の一覧
     *
     * @return list<string>
     */
    public function keywords(): array
    {
        $keyword = trim((string) $this->validated('keyword'));

        if ($keyword === '') {
            return [];
        }

        return preg_split('/[\s　]+/u', $keyword, flags: PREG_SPLIT_NO_EMPTY);
    }

    public function sort(): string
    {
        return $this->validated('sort') ?? self::SORT_NEW;
    }
}
