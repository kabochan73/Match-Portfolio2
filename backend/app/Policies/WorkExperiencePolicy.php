<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkExperience;

/**
 * 職歴の認可。求職者は自分の職歴だけを編集・削除できる。
 * 他人の職歴IDを指定された場合は403を返す(存在は推測できてしまうが、認可をPolicyに統一するため受け入れている)
 */
class WorkExperiencePolicy
{
    public function update(User $user, WorkExperience $workExperience): bool
    {
        return $workExperience->user_id === $user->id;
    }

    public function delete(User $user, WorkExperience $workExperience): bool
    {
        return $workExperience->user_id === $user->id;
    }
}
