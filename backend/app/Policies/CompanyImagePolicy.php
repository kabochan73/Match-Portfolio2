<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\CompanyImage;

/**
 * 企業ギャラリーの写真の認可。企業は自社の写真だけを削除できる(他社の写真IDなら403)。
 * auth:companyミドルウェアが既定のガードを企業に切り替えるため、第1引数にはログイン中の企業が渡される
 */
class CompanyImagePolicy
{
    public function delete(Company $company, CompanyImage $companyImage): bool
    {
        return $companyImage->company_id === $company->id;
    }
}
