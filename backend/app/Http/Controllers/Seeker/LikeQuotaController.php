<?php

namespace App\Http\Controllers\Seeker;

use App\Http\Controllers\Controller;
use App\Models\Like;
use App\Models\User;
use App\Services\LikeSender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * 今月のいいねの残り回数(いいねフォーム・ヘッダーで表示する)
 */
class LikeQuotaController extends Controller
{
    public function show(Request $request, LikeSender $sender): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('web');

        return response()->json([
            'data' => [
                ...$sender->quota($user),
                'resets_at' => Like::nextQuotaReset(),
            ],
        ]);
    }
}
