<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 求職者の求人ブックマーク。件数上限なし、企業には公開しない。
        // 付ける・外すだけで更新はないため、updated_atは持たない
        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // 削除できるのはいいね0件の求人だけなので、求人と一緒に消えても応募履歴には影響しない
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            $table->timestamp('created_at')->nullable();

            // 同じ求人の二重ブックマークを防ぐ。先頭がuser_idなので「自分のブックマーク一覧」の取得にも使われる
            $table->unique(['user_id', 'job_posting_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookmarks');
    }
};
