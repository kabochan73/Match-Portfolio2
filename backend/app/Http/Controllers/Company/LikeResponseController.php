<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReceivedLikeResource;
use App\Models\Like;
use App\Services\LikeResponder;
use Illuminate\Support\Facades\Gate;

/**
 * 応募への返事(気になる・見送り)
 */
class LikeResponseController extends Controller
{
    /**
     * 気になる(マッチ成立。応募者のメールアドレスが見られるようになる)
     */
    public function match(Like $like, LikeResponder $responder): ReceivedLikeResource
    {
        Gate::authorize('respond', $like);

        $responder->match($like);

        return new ReceivedLikeResource($like->load(['user', 'jobPosting:id,title']));
    }

    /**
     * 見送り
     */
    public function decline(Like $like, LikeResponder $responder): ReceivedLikeResource
    {
        Gate::authorize('respond', $like);

        $responder->decline($like);

        return new ReceivedLikeResource($like->load(['user', 'jobPosting:id,title']));
    }
}
