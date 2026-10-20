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
        // 求職者の学歴。1人につき0件以上。表示順は登録順
        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            // PostgreSQLは外部キーに自動でインデックスを作らないため、明示的に作る
            $table->foreignId('user_id')->index()->constrained()->cascadeOnDelete();
            $table->string('school_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educations');
    }
};
