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
        // 求人票の画像ギャラリー。1求人あたり最大5枚の上限はアップロード時のバリデーションで検証する。
        // 並び替えはしない(登録順=表示順)ため、positionカラムは持たない。1枚目が求人カードのカバー画像になる
        Schema::create('job_posting_images', function (Blueprint $table) {
            $table->id();
            // PostgreSQLは外部キーに自動でインデックスを作らないため、明示的に作る
            $table->foreignId('job_posting_id')->index()->constrained()->cascadeOnDelete();
            // 画像はストレージに保存し、相対パスのみ持つ
            $table->string('path');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting_images');
    }
};
