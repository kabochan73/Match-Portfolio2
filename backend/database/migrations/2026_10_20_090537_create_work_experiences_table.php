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
        // 求職者の職歴。1人につき0件以上
        Schema::create('work_experiences', function (Blueprint $table) {
            $table->id();
            // PostgreSQLは外部キーに自動でインデックスを作らないため、明示的に作る
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->string('company_name');
            // 年月のみ扱うため、日は1日に固定して保存する
            $table->date('started_on');
            // nullは在籍中
            $table->date('ended_on')->nullable();
            $table->string('employment_type');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_experiences');
    }
};
