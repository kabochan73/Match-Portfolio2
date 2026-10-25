<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * デモ用の求職者とプロフィール(内容はdata/demo_seekers.php)。1人目はデモ用の求職者アカウントで、ログインできるのはこの1人だけ。
 * デモ用の求職者アカウントがすでにあれば何もしない
 */
class DemoSeekerSeeder extends Seeder
{
    /** デモ用の求職者アカウントのメールアドレス(ほかのデモ用seederからも使う) */
    public const EMAIL = 'demo-seeker@example.com';

    public const PASSWORD = 'password1234';

    public function __construct(private readonly DemoImages $images) {}

    public function run(): void
    {
        if (User::query()->where('email', self::EMAIL)->exists()) {
            $this->command->info('デモ用の求職者は作成済みのため、何もしません。');

            return;
        }

        foreach (require __DIR__.'/data/demo_seekers.php' as $data) {
            $this->createSeeker($data);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createSeeker(array $data): void
    {
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            // ログインに使うのはデモ用の求職者アカウントだけ。ほかの人は、誰にもログインして書き換えられないよう推測できないパスワードにする
            'password' => $data['email'] === self::EMAIL ? self::PASSWORD : Str::random(32),
            // 実行した日から逆算し、いつ実行しても同じ年齢になるようにする(誕生日は数か月前)
            'birth_date' => now()->subYears($data['age'])->subMonths(3)->toDateString(),
            'comment' => $data['comment'],
            'portfolio_url' => $data['portfolio_url'],
            'avatar_path' => $data['avatar'] === null ? null : $this->images->seekerAvatar(...$data['avatar']),
        ]);

        foreach ($data['work_experiences'] as [$companyName, $startedOn, $endedOn, $employmentType]) {
            $user->workExperiences()->create([
                'company_name' => $companyName,
                // 年月は月初めの日として保存する(画面から登録したときと同じ)
                'started_on' => CarbonImmutable::createFromFormat('Y-m', $startedOn)->startOfMonth(),
                'ended_on' => $endedOn === null ? null : CarbonImmutable::createFromFormat('Y-m', $endedOn)->startOfMonth(),
                'employment_type' => EmploymentType::from($employmentType),
            ]);
        }

        foreach ($data['educations'] as $schoolName) {
            $user->educations()->create(['school_name' => $schoolName]);
        }

        foreach ($data['certifications'] as $name) {
            $user->certifications()->create(['name' => $name]);
        }
    }
}
