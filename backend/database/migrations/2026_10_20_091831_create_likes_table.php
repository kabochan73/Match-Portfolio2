<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // いいね(=応募)。いいねした時点でレコードを作る。created_atがいいねした日時
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // いいねがある求人は削除できないよう、restrictにする(画面・APIでの防止に加えた最後の防御)
            $table->foreignId('job_posting_id')->constrained()->restrictOnDelete();
            $table->string('like_type');
            // 志望動機(文字数上限なし)
            $table->text('motivation');
            $table->string('status')->default('applied');
            // いいねした日時+7日。企業の反応期限
            $table->timestamp('response_deadline');
            // 企業がマッチ(気になる)または見送りを返した日時
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            // 月間上限のカウント(当月にいいねした件数を種類ごとに数える)
            $table->index(['user_id', 'like_type', 'created_at']);
            // 応募者一覧・反応待ち件数
            $table->index(['job_posting_id', 'status']);
            // 人気順の並び替え(直近30日のいいね数を求人ごとに数える)
            $table->index(['job_posting_id', 'created_at']);
            // 期限切れバッチ(反応待ちのうち期限を過ぎたものを探す)
            $table->index(['status', 'response_deadline']);
        });

        // 期限切れ以外の状態(反応待ち・マッチ・見送り)では、同じ求人へ重複していいねできないようにする。
        // 期限切れの求人には再度いいねできるよう、expiredの行は対象外にする(PostgreSQLの部分ユニークインデックス)
        DB::statement(
            "CREATE UNIQUE INDEX likes_user_id_job_posting_id_unique ON likes (user_id, job_posting_id) WHERE status <> 'expired'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
