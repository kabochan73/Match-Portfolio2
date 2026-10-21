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
        // 求人。同時に公開できるのは1社10件まで(アプリ側で検証)。
        // いいね数はカウンタカラムを持たず、likesを数えて算出する
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            // 仕事内容
            $table->text('description');
            // 求める人材
            $table->text('desired_candidate');
            $table->string('employment_type');
            // 勤務地(都道府県 or リモート)
            $table->string('prefecture');
            // 月給(円)。範囲ではなく1つの金額で持つ(求職者が実際の金額を判断しやすいように)。表示のみで絞り込みには使わない
            $table->unsignedInteger('salary');
            // 選考フロー。ステップ名の配列(1〜6件)
            $table->jsonb('selection_steps');
            $table->string('status')->default('draft');
            // 初回公開日時。募集再開では更新しない(NEWラベルと新着順の基準)
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // 求人検索の絞り込み
            $table->index(['status', 'prefecture', 'employment_type']);
            // 企業ページの募集中の求人・公開中件数の上限チェック。先頭がcompany_idなので外部キーのインデックスも兼ねる
            $table->index(['company_id', 'status']);
            // 新着順の並び替え
            $table->index(['status', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
