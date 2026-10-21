<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use App\Services\JobPostingPublisher;
use Illuminate\Support\Facades\Gate;

/**
 * 求人の公開・募集終了(状態の切り替え)
 */
class JobPostingStatusController extends Controller
{
    /**
     * 公開する(下書きから、または募集終了からの再開)
     */
    public function publish(JobPosting $jobPosting, JobPostingPublisher $publisher): JobPostingResource
    {
        Gate::authorize('update', $jobPosting);

        $publisher->publish($jobPosting);

        return new JobPostingResource($jobPosting);
    }

    /**
     * 募集終了にする
     */
    public function close(JobPosting $jobPosting, JobPostingPublisher $publisher): JobPostingResource
    {
        Gate::authorize('update', $jobPosting);

        $publisher->close($jobPosting);

        return new JobPostingResource($jobPosting);
    }
}
