<?php

namespace App\Policies;

use App\Models\Education;
use App\Models\User;

/**
 * 学歴の認可。求職者は自分の学歴だけを編集・削除できる(他人の学歴IDなら403)
 */
class EducationPolicy
{
    public function update(User $user, Education $education): bool
    {
        return $education->user_id === $user->id;
    }

    public function delete(User $user, Education $education): bool
    {
        return $education->user_id === $user->id;
    }
}
