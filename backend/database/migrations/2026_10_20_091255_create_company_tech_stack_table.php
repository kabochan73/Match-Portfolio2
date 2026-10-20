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
        // 企業⇔技術スタック(企業ページ④)。選択数の上限なし
        Schema::create('company_tech_stack', function (Blueprint $table) {
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            // 企業に使われている技術スタックは、マスタから削除できないようにする
            $table->foreignId('tech_stack_id')->constrained()->restrictOnDelete();

            // 先頭がcompany_idの複合インデックスを兼ねる
            $table->primary(['company_id', 'tech_stack_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_tech_stack');
    }
};
