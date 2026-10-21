<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\JobPosting;

/**
 * 求人の認可(企業による管理)。企業は自社の求人だけを閲覧・編集できる(他社の求人IDなら403)
 */
class JobPostingPolicy
{
    public function view(Company $company, JobPosting $jobPosting): bool
    {
        return $jobPosting->company_id === $company->id;
    }

    public function update(Company $company, JobPosting $jobPosting): bool
    {
        return $jobPosting->company_id === $company->id;
    }

    public function delete(Company $company, JobPosting $jobPosting): bool
    {
        return $jobPosting->company_id === $company->id;
    }
}
