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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Geometry\Factories\CircleFactory;
use Intervention\Image\Geometry\Factories\RectangleFactory;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

/**
 * 企業ページの見た目を確かめるための、項目をひととおり埋めた企業1社と公開中の求人。
 * 画像は写真の代わりに、色と図形だけのダミー画像を作って保存する。
 * すでに作成済みなら何もしない(php artisan db:seed --class=DemoCompanySeeder)
 */
class DemoCompanySeeder extends Seeder
{
    private const EMAIL = 'demo-company@example.com';

    /** ギャラリーの背景色と、上に重ねる図形の色 */
    private const GALLERY_COLORS = [
        ['#1e3a5f', '#7dd3fc'],
        ['#7dd3fc', '#ffffff'],
        ['#e11d48', '#fde68a'],
        ['#0f766e', '#a7f3d0'],
    ];

    public function run(): void
    {
        if (Company::query()->where('email', self::EMAIL)->exists()) {
            $this->command->info('デモ企業は作成済みのため、何もしません。');

            return;
        }

        $company = Company::query()->create([
            'name' => '株式会社ノースブリッジ',
            'email' => self::EMAIL,
            'password' => 'password1234',
            'avatar_path' => $this->storeLogo(),
            'introduction' => '「働く」をもっとなめらかに。中小企業向けの業務SaaSをつくっています。',
            'business_description' => "中小企業向けに、勤怠・経費・ワークフローをひとつにまとめたクラウドサービス「Bridge Office」を開発・運営しています。\n\n導入企業は全国で3,000社を超えました。現場の声を毎週プロダクトに反映し、月2回のペースで新機能をリリースしています。\n\n今後は、蓄積したデータを活かした分析機能や、外部サービスとの連携を強化していく予定です。",
            'culture' => "職種に関係なく、誰でも仕様に意見を出せる文化です。週1回の「ユーザーの声共有会」では、エンジニアも営業もサポートも同じテーブルで改善案を話し合います。\n\nコードレビューは「指摘」より「提案」を大切にしていて、新しく入った人でも遠慮なく質問できる雰囲気です。\n\n勉強会や書籍の購入、カンファレンスへの参加も会社が支援しています。",
            'founded_year' => 2016,
            'member_count' => 85,
            'prefecture' => Prefecture::Tokyo,
            'address_line' => '渋谷区神南1-2-3 ノースビル5F',
            'website_url' => 'https://example.com',
        ]);

        $company->techStacks()->sync($this->techStackIds([
            'PHP', 'Laravel', 'TypeScript', 'React', 'Next.js', 'PostgreSQL', 'AWS', 'Docker', 'Terraform', 'GitHub Actions',
        ]));
        $company->workStyles()->sync(
            WorkStyle::query()->whereIn('name', ['リモート併用', 'フレックスタイム', '服装自由', '副業OK'])->pluck('id'),
        );

        foreach (self::GALLERY_COLORS as [$background, $shape]) {
            $company->images()->create(['path' => $this->storeGalleryImage('company-images', $background, $shape)]);
        }

        $this->createJobPostings($company);
    }

    private function createJobPostings(Company $company): void
    {
        $jobPostings = [
            [
                'title' => 'Laravelで勤怠SaaSを開発するバックエンドエンジニア',
                'category' => 'バックエンド',
                'tech_stacks' => ['PHP', 'Laravel', 'PostgreSQL', 'AWS', 'Docker'],
                'salary' => 450000,
                'colors' => ['#1e3a5f', '#7dd3fc'],
            ],
            [
                'title' => 'Next.jsで管理画面をつくるフロントエンドエンジニア',
                'category' => 'フロントエンド',
                'tech_stacks' => ['TypeScript', 'React', 'Next.js'],
                'salary' => 400000,
                'colors' => ['#7dd3fc', '#1e3a5f'],
            ],
            [
                'title' => 'AWSの基盤を支えるSRE',
                'category' => 'SRE',
                'tech_stacks' => ['AWS', 'Terraform', 'Docker', 'GitHub Actions'],
                'salary' => 500000,
                'colors' => ['#0f766e', '#a7f3d0'],
            ],
        ];

        foreach ($jobPostings as $index => $data) {
            $jobPosting = $company->jobPostings()->create([
                'title' => $data['title'],
                'description' => "「Bridge Office」の開発チームで、{$data['category']}の開発を担当していただきます。\n\n企画の段階からチームに加わり、ユーザーの課題をどう解決するかを一緒に考えるところから関われます。\n\nチームは5〜6名で、スプリントは2週間です。",
                'desired_candidate' => "・{$data['category']}の実務経験が2年以上ある方\n・ユーザーの声をもとに、プロダクトを良くしていくことに関心がある方",
                'employment_type' => EmploymentType::FullTime,
                'prefecture' => Prefecture::Tokyo,
                'salary' => $data['salary'],
                'selection_steps' => ['カジュアル面談', '一次面接', '最終面接', '内定'],
                'status' => JobPostingStatus::Published,
                // 新しい順に並んだときに、上から順番どおりに出るようにずらす
                'published_at' => now()->subDays($index + 1),
            ]);

            $jobPosting->jobCategories()->sync(JobCategory::query()->where('name', $data['category'])->pluck('id'));
            $jobPosting->techStacks()->sync($this->techStackIds($data['tech_stacks']));
            $jobPosting->images()->create([
                'path' => $this->storeGalleryImage('job-posting-images', ...$data['colors']),
            ]);
        }
    }

    /**
     * @param  list<string>  $names
     * @return list<int>
     */
    private function techStackIds(array $names): array
    {
        return TechStack::query()->whereIn('name', $names)->pluck('id')->all();
    }

    /**
     * ロゴの代わりに、紺地に水色の丸を描いた正方形の画像を保存する
     */
    private function storeLogo(): string
    {
        $image = ImageManager::usingDriver(GdDriver::class)
            ->createImage(400, 400)
            ->fill('#1e3a5f')
            ->drawCircle(fn (CircleFactory $circle) => $circle->at(200, 200)->radius(110)->background('#7dd3fc'));

        return $this->store($image, 'avatars/companies');
    }

    /**
     * 写真の代わりに、背景色の上に四角と丸を重ねた16:9の画像を保存する
     */
    private function storeGalleryImage(string $directory, string $background, string $shape): string
    {
        $image = ImageManager::usingDriver(GdDriver::class)
            ->createImage(1600, 900)
            ->fill($background)
            ->drawRectangle(fn (RectangleFactory $rectangle) => $rectangle->at(160, 180)->size(560, 540)->background($shape))
            ->drawCircle(fn (CircleFactory $circle) => $circle->at(1150, 450)->radius(240)->background($shape));

        return $this->store($image, $directory);
    }

    private function store(ImageInterface $image, string $directory): string
    {
        $path = $directory.'/'.Str::random(40).'.webp';

        Storage::put($path, (string) $image->encode(new WebpEncoder(quality: 80)));

        return $path;
    }
}
