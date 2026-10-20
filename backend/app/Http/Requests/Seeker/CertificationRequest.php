<?php

namespace App\Http\Requests\Seeker;

use App\Models\Certification;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * 資格の追加・編集
 */
class CertificationRequest extends FormRequest
{
    /**
     * ログインは認証ミドルウェア、自分の資格かどうかはPolicyで確認するため、ここでは常に許可する
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
        /** @var Certification|null $certification 編集時のみ(追加時はnull) */
        $certification = $this->route('certification');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                // 同じ資格の二重登録を防ぐ(DBのunique制約だけだと500エラーになるため、422で分かりやすく返す)。
                // 判定は自分の資格の中だけで行い、編集時は自分自身を除外する
                Rule::unique('certifications')
                    ->where('user_id', $this->user('web')->id)
                    ->ignore($certification),
            ],
        ];
    }

    /**
     * 共通の項目名では`name`が「名前」(会員登録用)になるため、資格では「資格名」と表示する
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '資格名',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'その資格はすでに登録されています。',
        ];
    }
}
