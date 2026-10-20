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
        // 企業。1社1アカウントで、ログインの主体を兼ねる。
        // 企業ページの項目はすべてnullable(会員登録直後は会社名だけの状態を許容する)
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // ログインID。求職者には公開しない
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->string('avatar_path')->nullable();
            // 企業ページ ①簡単な自己紹介 ②事業内容 ③カルチャー
            $table->string('introduction', 200)->nullable();
            $table->text('business_description')->nullable();
            $table->text('culture')->nullable();
            // 企業ページ ⑦基本情報
            $table->unsignedSmallInteger('founded_year')->nullable();
            $table->unsignedInteger('member_count')->nullable();
            $table->string('prefecture')->nullable();
            $table->string('address_line')->nullable();
            $table->string('website_url')->nullable();
            $table->timestamps();
        });

        // 企業用のパスワードリセット。求職者(users)と同じメールアドレスが登録されていても混同しないよう、テーブルを分ける
        Schema::create('company_password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_password_reset_tokens');
        Schema::dropIfExists('companies');
    }
};
