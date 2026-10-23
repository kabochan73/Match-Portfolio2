<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * アプリ内通知(求職者・企業で共通)。
 * /api/seeker/notifications(auth:web)と/api/company/notifications(auth:company)の両方から使い、
 * ログイン中の本人の通知だけを扱う(他人の通知は見つからない扱いで404)
 */
class NotificationController extends Controller
{
    private const PER_PAGE = 20;

    /**
     * 通知の一覧(新しい順)。未読の数もmetaに含める
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $notifiable = $this->notifiable($request);

        return NotificationResource::collection($notifiable->notifications()->paginate(self::PER_PAGE))
            ->additional(['meta' => ['unread_count' => $notifiable->unreadNotifications()->count()]]);
    }

    /**
     * 未読の数だけ(ヘッダーのベルのバッジ用。ページを開くたびに呼ぶため、件数だけを返す)
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ['unread_count' => $this->notifiable($request)->unreadNotifications()->count()],
        ]);
    }

    /**
     * 1件を既読にする(通知を押して、応募の画面へ移るとき)
     */
    public function markAsRead(Request $request, string $id): NotificationResource
    {
        $notification = $this->notifiable($request)->notifications()->findOrFail($id);
        $notification->markAsRead();

        return new NotificationResource($notification);
    }

    /**
     * ログイン中の求職者または企業(ルートのauthミドルウェアで、どちらかに決まっている)
     */
    private function notifiable(Request $request): User|Company
    {
        /** @var User|Company */
        return $request->user();
    }
}
