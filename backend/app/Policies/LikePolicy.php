<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\Like;
use App\Models\User;

/**
 * いいね(応募)の権限。求職者は自分のいいねだけ、企業は自社の求人へのいいねだけを扱える
 */
class LikePolicy
{
    public function view(User|Company $actor, Like $like): bool
    {
        if ($actor instanceof User) {
            return $like->user_id === $actor->id;
        }

        return $this->isReceivedBy($actor, $like);
    }

    /**
     * 気になる・見送りを返す
     */
    public function respond(Company $company, Like $like): bool
    {
        return $this->isReceivedBy($company, $like);
    }

    private function isReceivedBy(Company $company, Like $like): bool
    {
        return $like->jobPosting->company_id === $company->id;
    }
}
