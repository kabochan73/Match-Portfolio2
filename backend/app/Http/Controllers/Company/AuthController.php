<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Concerns\ThrottlesLogins;
use App\Http\Controllers\Controller;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Auth\SessionGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * 企業の認証(会員登録・ログイン・ログアウト・ログイン中の本人取得)
 */
class AuthController extends Controller
{
    use ThrottlesLogins;

    private const GUARD = 'company';

    /**
     * 会員登録。企業の審査は行わず、登録と同時にログイン状態にする。
     * 企業ページの項目は登録後に編集画面で入力する
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // 求職者(users)とは別テーブルのため、同じメールアドレスでも登録できる
            'email' => ['required', 'string', 'email', 'max:255', 'unique:companies'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $company = Company::create($validated);

        $this->startSession($request, $company);

        return (new CompanyResource($company))->response()->setStatusCode(201);
    }

    /**
     * ログイン
     *
     * @throws ValidationException
     */
    public function login(Request $request): CompanyResource
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $this->ensureIsNotRateLimited($request, self::GUARD);

        $guard = $this->sessionGuard();

        if (! $guard->validate($credentials)) {
            $this->hitRateLimiter($request, self::GUARD);

            // 「メールアドレスが未登録」と「パスワードが違う」を区別しない(アカウントの存在を推測されないようにするため)
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $this->clearRateLimiter($request, self::GUARD);

        /** @var Company $company */
        $company = $guard->getLastAttempted();

        $this->startSession($request, $company);

        return new CompanyResource($company);
    }

    /**
     * ログアウト
     */
    public function logout(Request $request): Response
    {
        Auth::guard(self::GUARD)->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    /**
     * ログイン中の企業本人
     */
    public function me(Request $request): CompanyResource
    {
        return new CompanyResource($request->user(self::GUARD));
    }

    /**
     * このコントローラーで使うセッションガード。
     * Auth::guard()の戻り値はインターフェース型のため、SessionGuard固有のメソッド(getLastAttempted)を型安全に使えるようにする
     */
    private function sessionGuard(): SessionGuard
    {
        $guard = Auth::guard(self::GUARD);
        assert($guard instanceof SessionGuard);

        return $guard;
    }

    /**
     * 企業としてログイン状態にする。
     * 求職者と企業に同時にログインしないよう、求職者側のログインは解除する
     */
    private function startSession(Request $request, Company $company): void
    {
        Auth::guard('web')->logout();
        Auth::guard(self::GUARD)->login($company);

        // セッション固定化攻撃の対策として、ログイン成功時はセッションIDを作り直す
        $request->session()->regenerate();
    }
}
