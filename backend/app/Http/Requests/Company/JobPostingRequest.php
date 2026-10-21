<?php

namespace App\Http\Requests\Company;

use App\Enums\EmploymentType;
use App\Enums\Prefecture;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 求人の作成・編集。状態(下書き・公開中・募集終了)はここでは受け取らず、公開・募集終了の操作でのみ変える
 */
class JobPostingRequest extends FormRequest
{
    /** 月給(円)として受け付ける範囲。万円→円の変換漏れ(35円等)や桁の打ち間違いを弾く */
    private const SALARY_MIN = 100000;

    private const SALARY_MAX = 2000000;

    /**
     * ログインは認証ミドルウェア、自社の求人かどうかはPolicyで確認するため、ここでは常に許可する
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
            // 求人カードに収まる長さ
            'title' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:5000'],
            'desired_candidate' => ['required', 'string', 'max:3000'],
            'employment_type' => ['required', Rule::enum(EmploymentType::class)],
            // 勤務地はリモートも選べる
            'prefecture' => ['required', Rule::enum(Prefecture::class)],
            // 月給は円で受け取る(フォームの万円からの変換はフロントで行う)
            'salary' => ['required', 'integer', 'min:'.self::SALARY_MIN, 'max:'.self::SALARY_MAX],
            'selection_steps' => ['required', 'array', 'min:1', 'max:6'],
            'selection_steps.*' => ['required', 'string', 'max:30'],
            'job_category_ids' => ['required', 'array', 'min:1', 'max:3'],
            'job_category_ids.*' => ['integer', 'distinct', 'exists:job_categories,id'],
            // 技術スタックは任意だが、「送られたIDの状態」にそろえるため、選択なしでも空の配列を送ってもらう
            'tech_stack_ids' => ['present', 'array'],
            'tech_stack_ids.*' => ['integer', 'distinct', 'exists:tech_stacks,id'],
        ];
    }

    /**
     * 共通の項目名では`prefecture`が「都道府県」のため、求人では勤務地と表示する
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'prefecture' => '勤務地',
        ];
    }

    /**
     * 標準のメッセージでは円の金額(100000等)や項目数がそのまま出て分かりにくいものを言い換える
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'salary.min' => '月給は10万円以上で指定してください。',
            'salary.max' => '月給は200万円以下で指定してください。',
            'selection_steps.min' => '選考フローを1ステップ以上入力してください。',
            'selection_steps.max' => '選考フローは6ステップまでです。',
            'job_category_ids.min' => '職種を1つ以上選んでください。',
            'job_category_ids.max' => '職種は3つまで選べます。',
        ];
    }

    /**
     * job_postingsテーブルに保存する項目
     *
     * @return array<string, mixed>
     */
    public function jobPostingAttributes(): array
    {
        return $this->safe()->except(['job_category_ids', 'tech_stack_ids']);
    }
}
