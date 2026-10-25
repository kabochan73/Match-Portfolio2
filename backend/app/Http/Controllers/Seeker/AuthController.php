<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Concerns\ThrottlesLogins;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\SessionGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * 求職者の認証(会員登録・ログイン・ログアウト・ログイン中の本人取得)
 */
class AuthController extends Controller
{
    use ThrottlesLogins;

    private const GUARD = 'web';

    /**
     * 会員登録。メール認証は行わないため、登録と同時にログイン状態にする
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'birth_date' => User::birthDateRules(),
        ]);

        $user = User::create($validated);

        $this->startSession($request, $user);

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    /**
     * ログイン
     *
     * @throws ValidationException
     */
    public function login(Request $request): UserResource
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

        /** @var User $user */
        $user = $guard->getLastAttempted();

        $this->startSession($request, $user);

        return new UserResource($user);
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
     * ログイン中の求職者本人
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user(self::GUARD));
    }

    /**
     * このコントローラーで使うセッションガード。
     * SessionGuard固有のメソッド(getLastAttempted)を使うため、戻り値をSessionGuardにする(設定のドライバーがsessionのため、実際にSessionGuardが返る)
     */
    private function sessionGuard(): SessionGuard
    {
        return Auth::guard(self::GUARD);
    }

    /**
     * 求職者としてログイン状態にする。
     * 求職者と企業に同時にログインしないよう、企業側のログインは解除する
     */
    private function startSession(Request $request, User $user): void
    {
        Auth::guard('company')->logout();
        Auth::guard(self::GUARD)->login($user);

        // セッション固定化攻撃の対策として、ログイン成功時はセッションIDを作り直す
        $request->session()->regenerate();
    }
}
