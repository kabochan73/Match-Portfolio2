<?php

namespace Database\Seeders;

use App\Enums\EmploymentType;
use App\Enums\JobPostingStatus;
use App\Enums\Prefecture;
use App\Models\Company;
use App\Models\JobCategory;
use App\Models\TechStack;
use App\Models\WorkStyle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * デモ用の企業と求人(内容はdata/demo_companies.php)。1社目はデモ用の企業アカウントで、ログインできるのはこの1社だけ。
 * 画像は写真の代わりに、会社ごとの色で描いたダミー画像を保存する。
 * デモ用の企業アカウントがすでにあれば何もしない
 */
class DemoCompanySeeder extends Seeder
{
    /** デモ用の企業アカウントのメールアドレス(ほかのデモ用seederからも使う) */
    public const EMAIL = 'demo-company@example.com';

    public const PASSWORD = 'password1234';

    /** 企業ページの写真の枚数 */
    private const GALLERY_COUNT = 3;

    public function __construct(private readonly DemoImages $images) {}

    public function run(): void
    {
        if (Company::query()->where('email', self::EMAIL)->exists()) {
            $this->command->info('デモ用の企業は作成済みのため、何もしません。');

            return;
        }

        foreach (require __DIR__.'/data/demo_companies.php' as $data) {
            $this->createCompany($data);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createCompany(array $data): void
    {
        [$background, $shape] = $data['colors'];

        $company = Company::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            // ログインに使うのはデモ用の企業アカウントだけ。ほかの会社は、誰にもログインして書き換えられないよう推測できないパスワードにする
            'password' => $data['email'] === self::EMAIL ? self::PASSWORD : Str::random(32),
            'avatar_path' => $this->images->logo($background, $shape),
            'introduction' => $data['introduction'],
            'business_description' => $data['business_description'],
            'culture' => $data['culture'],
            'founded_year' => $data['founded_year'],
            'member_count' => $data['member_count'],
            'prefecture' => Prefecture::from($data['prefecture']),
            'address_line' => $data['address_line'],
            'website_url' => 'https://example.com',
        ]);

        $company->techStacks()->sync($this->techStackIds($data['tech_stacks']));
        $company->workStyles()->sync(WorkStyle::query()->whereIn('name', $data['work_styles'])->pluck('id'));

        for ($variant = 0; $variant < self::GALLERY_COUNT; $variant++) {
            $company->images()->create([
                'path' => $this->images->photo('company-images', $background, $shape, $variant),
            ]);
        }

        foreach ($data['job_postings'] as $index => $jobData) {
            $this->createJobPosting($company, $jobData, [$background, $shape], $index);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array{0: string, 1: string}  $colors
     */
    private function createJobPosting(Company $company, array $data, array $colors, int $index): void
    {
        $status = JobPostingStatus::from($data['status']);

        $jobPosting = $company->jobPostings()->create([
            'title' => $data['title'],
            'description' => $data['description'],
            'desired_candidate' => $data['desired_candidate'],
            'employment_type' => EmploymentType::from($data['employment_type']),
            'prefecture' => Prefecture::from($data['prefecture']),
            'salary' => $data['salary'],
            'selection_steps' => $data['selection_steps'],
            'status' => $status,
            'published_at' => $data['published_days_ago'] === null ? null : now()->subDays($data['published_days_ago']),
        ]);

        $jobPosting->jobCategories()->sync(JobCategory::query()->whereIn('name', $data['categories'])->pluck('id'));
        $jobPosting->techStacks()->sync($this->techStackIds($data['tech_stacks']));
        // 会社の色の図形を、求人ごとに並びを変えて使う(カードで見分けやすくする)
        $jobPosting->images()->create([
            'path' => $this->images->photo('job-posting-images', $colors[0], $colors[1], $index + 1),
        ]);
    }

    /**
     * @param  list<string>  $names
     * @return array<int, int>
     */
    private function techStackIds(array $names): array
    {
        return TechStack::query()->whereIn('name', $names)->pluck('id')->map(fn (mixed $id): int => (int) $id)->all();
    }
}
