<?php

namespace App\Policies;

use App\Models\Certification;
use App\Models\User;

/**
 * 資格の認可。求職者は自分の資格だけを編集・削除できる(他人の資格IDなら403)
 */
class CertificationPolicy
{
    public function update(User $user, Certification $certification): bool
    {
        return $certification->user_id === $user->id;
    }

    public function delete(User $user, Certification $certification): bool
    {
        return $certification->user_id === $user->id;
    }
}
