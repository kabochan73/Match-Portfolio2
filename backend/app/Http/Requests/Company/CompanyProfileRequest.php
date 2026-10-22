<?php

namespace App\Http\Requests\Company;

use App\Enums\Prefecture;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 企業ページの編集。基本の項目と、技術スタック・働き方の選択をまとめて受け取る
 */
class CompanyProfileRequest extends FormRequest
{
    /**
     * ログインは認証ミドルウェアで確認し、編集対象は常にログイン中の企業本人のため、ここでは常に許可する
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
            'name' => ['required', 'string', 'max:255'],
            'introduction' => ['nullable', 'string', 'max:200'],
            // 極端に長い文章で企業ページが崩れないよう上限を設ける(A4用紙1枚強)
            'business_description' => ['nullable', 'string', 'max:2000'],
            'culture' => ['nullable', 'string', 'max:2000'],
            'founded_year' => ['nullable', 'integer', 'min:1800', 'max:'.now()->year],
            'member_count' => ['nullable', 'integer', 'min:1', 'max:1000000'],
            // 企業の所在地にリモートは選べない(リモートは求人の勤務地のための選択肢)
            'prefecture' => ['nullable', Rule::enum(Prefecture::class)->except(Prefecture::Remote)],
            'address_line' => ['nullable', 'string', 'max:255'],
            // 求職者が開くリンクのため、ブラウザで開けるhttp・httpsだけを受け付ける
            'website_url' => ['nullable', 'string', 'url:http,https', 'max:255'],
            // タグは「送られたIDの状態」にそろえるため、選択なしでも空の配列を送ってもらう
            'tech_stack_ids' => ['present', 'array'],
            'tech_stack_ids.*' => ['integer', 'distinct', 'exists:tech_stacks,id'],
            'work_style_ids' => ['present', 'array'],
            'work_style_ids.*' => ['integer', 'distinct', 'exists:work_styles,id'],
        ];
    }

    /**
     * 共通の項目名(`name`=名前、`prefecture`=都道府県)を、企業ページに合わせた名前で表示する
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '会社名',
            'prefecture' => '所在地(都道府県)',
        ];
    }

    /**
     * companiesテーブルに保存する項目
     *
     * @return array<string, mixed>
     */
    public function profileAttributes(): array
    {
        return $this->safe()->except(['tech_stack_ids', 'work_style_ids']);
    }
}
