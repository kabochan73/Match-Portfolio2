<?php

namespace App\Policies;

use App\Models\Like;
use App\Models\User;

/**
 * いいね(応募)の閲覧権限。求職者は自分のいいねだけを見られる
 */
class LikePolicy
{
    public function view(User $user, Like $like): bool
    {
        return $like->user_id === $user->id;
    }
}
