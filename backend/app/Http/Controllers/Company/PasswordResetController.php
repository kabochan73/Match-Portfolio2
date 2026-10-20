<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

/**
 * 企業のパスワードリセット(再設定リンクの送信・パスワードの再設定)。
 * トークンは求職者と混同しないよう、企業用のテーブル(company_password_reset_tokens)に保存する
 */
class PasswordResetController extends Controller
{
    private const BROKER = 'companies';

    /**
     * 再設定リンクをメールで送る。
     * アカウントの存在を推測されないよう、未登録・送信間隔の制限中でも同じ応答を返す
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        Password::broker(self::BROKER)->sendResetLink($request->only('email'));

        return response()->json([
            'message' => '登録されているメールアドレスであれば、パスワード再設定用のメールを送信しました。',
        ]);
    }

    /**
     * メールのリンクに含まれるトークンを使って、パスワードを再設定する
     *
     * @throws ValidationException
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::broker(self::BROKER)->reset(
            $credentials,
            function (Company $company, string $password): void {
                // 「ログイン状態を保持」用のトークンも作り直し、他の端末に残ったログインを使えなくする
                $company->forceFill(['password' => $password])
                    ->setRememberToken(Str::random(60));
                $company->save();

                event(new PasswordReset($company));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => trans($status),
            ]);
        }

        return response()->json([
            'message' => 'パスワードを再設定しました。新しいパスワードでログインしてください。',
        ]);
    }
}
