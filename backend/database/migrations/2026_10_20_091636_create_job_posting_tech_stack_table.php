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
        // 求人⇔技術スタック。選択数の上限なし
        Schema::create('job_posting_tech_stack', function (Blueprint $table) {
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            // 求人に使われている技術スタックは、マスタから削除できないようにする。
            // 技術スタックで求人を絞り込む検索(技術→求人の逆引き)に使うため、インデックスを作る
            $table->foreignId('tech_stack_id')->index()->constrained()->restrictOnDelete();

            // 先頭がjob_posting_idの複合インデックスを兼ねる
            $table->primary(['job_posting_id', 'tech_stack_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting_tech_stack');
    }
};
