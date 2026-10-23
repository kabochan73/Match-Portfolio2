<?php

namespace App\Services;

use App\Enums\JobPostingStatus;
use App\Enums\LikeStatus;
use App\Enums\LikeType;
use App\Models\JobPosting;
use App\Models\Like;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * いいね(=応募)を送る。月間上限・重複応募のチェックをこのクラスに集める
 */
class LikeSender
{
    /**
     * いいねを送る。企業の反応期限は今から7日後
     *
     * @throws ValidationException
     */
    public function send(User $user, JobPosting $jobPosting, LikeType $likeType, string $motivation): Like
    {
        // 公開中でない(募集終了)求人には応募できない。下書きはコントローラーで404にしている
        if ($jobPosting->status !== JobPostingStatus::Published) {
            $this->fail('job_posting', 'この求人は募集を終了しています。');
        }

        try {
            return DB::transaction(function () use ($user, $jobPosting, $likeType, $motivation) {
                // 同じ求職者のいいねを1件ずつ順番に処理し、ほぼ同時に送られても上限を超えないようにする
                User::query()->whereKey($user->id)->lockForUpdate()->first();

                $alreadyLiked = $user->likes()
                    ->where('job_posting_id', $jobPosting->id)
                    ->where('status', '<>', LikeStatus::Expired)
                    ->exists();

                if ($alreadyLiked) {
                    $this->fail('job_posting', 'この求人にはすでにいいねしています。');
                }

                if ($this->usedThisMonth($user, $likeType) >= $likeType->monthlyLimit()) {
                    $this->fail('like_type', "今月の{$likeType->label()}は上限({$likeType->monthlyLimit()}回)に達しています。");
                }

                // 求職者・求人のIDは一括代入の対象にしていないため、リレーションで結び付ける
                $like = $user->likes()->make([
                    'like_type' => $likeType,
                    'motivation' => $motivation,
                    'status' => LikeStatus::Applied,
                    'response_deadline' => now()->addDays(Like::RESPONSE_DAYS),
                ]);
                $like->jobPosting()->associate($jobPosting);
                $like->save();

                return $like;
            });
        } catch (UniqueConstraintViolationException) {
            // 上のチェックをすり抜けた同時の重複応募は、DBの部分ユニークインデックスで弾かれる
            $this->fail('job_posting', 'この求人にはすでにいいねしています。');
        }
    }

    /**
     * 今月使った回数と上限(種類ごと)
     *
     * @return array<string, array{limit: int, used: int, remaining: int}>
     */
    public function quota(User $user): array
    {
        $quota = [];

        foreach (LikeType::cases() as $likeType) {
            $used = $this->usedThisMonth($user, $likeType);

            $quota[$likeType->value] = [
                'limit' => $likeType->monthlyLimit(),
                'used' => $used,
                'remaining' => max(0, $likeType->monthlyLimit() - $used),
            ];
        }

        return $quota;
    }

    /**
     * 今月(日本時間の1日0時から)作ったいいねの数。期限切れのいいねも数える(送った時点で1回分を使うため)
     */
    private function usedThisMonth(User $user, LikeType $likeType): int
    {
        return $user->likes()
            ->where('like_type', $likeType)
            ->where('created_at', '>=', Like::currentQuotaPeriodStart())
            ->count();
    }

    /**
     * いいねできない理由を、画面に表示できる形(422)で返す
     *
     * @throws ValidationException
     */
    private function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }
}
