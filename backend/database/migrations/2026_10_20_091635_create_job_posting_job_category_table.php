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
        // 求人⇔職種。1求人につき1〜3件(アプリ側で検証)
        Schema::create('job_posting_job_category', function (Blueprint $table) {
            $table->foreignId('job_posting_id')->constrained()->cascadeOnDelete();
            // 求人に使われている職種は、マスタから削除できないようにする。
            // 職種で求人を絞り込む検索(職種→求人の逆引き)に使うため、インデックスを作る
            $table->foreignId('job_category_id')->index()->constrained()->restrictOnDelete();

            // 先頭がjob_posting_idの複合インデックスを兼ねる
            $table->primary(['job_posting_id', 'job_category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting_job_category');
    }
};
