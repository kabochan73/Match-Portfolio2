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
        // 企業ページの写真ギャラリー。1社あたり最大5枚の上限はアップロード時のバリデーションで検証する。
        // 並び替えはしない(登録順=表示順)ため、positionカラムは持たない
        Schema::create('company_images', function (Blueprint $table) {
            $table->id();
            // PostgreSQLは外部キーに自動でインデックスを作らないため、明示的に作る
            $table->foreignId('company_id')->index()->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('company_images');
    }
};
