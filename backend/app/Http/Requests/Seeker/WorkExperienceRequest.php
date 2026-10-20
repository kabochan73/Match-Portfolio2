<?php

namespace App\Http\Requests\Seeker;

use App\Enums\EmploymentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * 職歴の追加・編集。年月は「2024-04」の形で受け取る
 */
class WorkExperienceRequest extends FormRequest
{
    /**
     * ログインは認証ミドルウェア、自分の職歴かどうかはPolicyで確認するため、ここでは常に許可する
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
        $currentMonth = now()->format('Y-m');

        return [
            'company_name' => ['required', 'string', 'max:255'],
            // date_formatがあると、before_or_equal等の比較も同じ形式(年月)で行われる
            'started_on' => ['required', 'date_format:Y-m', 'before_or_equal:'.$currentMonth],
            // 空なら在籍中
            'ended_on' => ['nullable', 'date_format:Y-m', 'after_or_equal:started_on', 'before_or_equal:'.$currentMonth],
            'employment_type' => ['required', Rule::enum(EmploymentType::class)],
        ];
    }

    /**
     * 保存用の値。年月は月の1日の日付に変換する
     *
     * @return array{company_name: string, started_on: string, ended_on: string|null, employment_type: string}
     */
    public function attributesForModel(): array
    {
        $validated = $this->validated();

        return [
            'company_name' => $validated['company_name'],
            'started_on' => $this->toFirstDayOfMonth($validated['started_on']),
            'ended_on' => $validated['ended_on'] === null ? null : $this->toFirstDayOfMonth($validated['ended_on']),
            'employment_type' => $validated['employment_type'],
        ];
    }

    private function toFirstDayOfMonth(string $yearMonth): string
    {
        return Carbon::createFromFormat('Y-m', $yearMonth)->startOfMonth()->toDateString();
    }
}
