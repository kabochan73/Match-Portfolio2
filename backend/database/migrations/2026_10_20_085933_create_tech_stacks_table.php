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
        // 技術スタックマスタ。企業・求人で共通利用する。データはシーダーで投入し運営のみが変更するため、タイムスタンプは持たない
        Schema::create('tech_stacks', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('group_name');
            $table->unsignedSmallInteger('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tech_stacks');
    }
};
