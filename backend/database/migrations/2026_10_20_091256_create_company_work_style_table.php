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
        // 企業⇔働き方(企業ページ⑤)。選択数の上限なし
        Schema::create('company_work_style', function (Blueprint $table) {
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // 企業に使われている働き方は、マスタから削除できないようにする
            $table->foreignId('work_style_id')->constrained()->restrictOnDelete();

            // 先頭がcompany_idの複合インデックスを兼ねる
            $table->primary(['company_id', 'work_style_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_work_style');
    }
};
