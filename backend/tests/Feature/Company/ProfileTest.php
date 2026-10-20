<?php

use App\Models\Company;
use App\Models\CompanyImage;
use App\Models\TechStack;
use App\Models\User;
use App\Models\WorkStyle;
use Illuminate\Support\Facades\Storage;

describe('show', function () {
    it('returns the company page with tech stacks, work styles, and gallery images', function () {
        Storage::fake();
        $company = Company::factory()->withProfile()->create();
        $company->techStacks()->attach([
            TechStack::factory()->create(['name' => 'Laravel', 'sort_order' => 2])->id,
            TechStack::factory()->create(['name' => 'PHP', 'sort_order' => 1])->id,
        ]);
        $company->workStyles()->attach(WorkStyle::factory()->create(['name' => 'フルリモート'])->id);
        $image = CompanyImage::factory()->for($company)->create(['path' => 'company-images/office.webp']);

        $this->actingAs($company, 'company')
            ->getJson('/api/company/profile')
            ->assertOk()
            ->assertJsonPath('data.id', $company->id)
            ->assertJsonPath('data.business_description', $company->business_description)
            // 技術スタックはマスタの表示順
            ->assertJsonPath('data.tech_stacks.0.name', 'PHP')
            ->assertJsonPath('data.tech_stacks.1.name', 'Laravel')
            ->assertJsonPath('data.work_styles.0.name', 'フルリモート')
            ->assertJsonPath('data.images.0.id', $image->id)
            ->assertJsonPath('data.images.0.url', Storage::url('company-images/office.webp'));
    });

    it('returns null for the logo URL and empty lists right after registration', function () {
        $company = Company::factory()->create();

        $this->actingAs($company, 'company')
            ->getJson('/api/company/profile')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null)
            ->assertJsonPath('data.introduction', null)
            ->assertJsonCount(0, 'data.tech_stacks')
            ->assertJsonCount(0, 'data.images');
    });

    it('returns 401 when not logged in', function () {
        $this->getJson('/api/company/profile')->assertUnauthorized();
    });

    it('returns 401 when logged in as a seeker', function () {
        $this->actingAs(User::factory()->create(), 'web')
            ->getJson('/api/company/profile')
            ->assertUnauthorized();
    });
});

describe('update', function () {
    /**
     * @return array<string, mixed>
     */
    function validCompanyProfile(array $overrides = []): array
    {
        return array_merge([
            'name' => '株式会社テックマッチ',
            'introduction' => 'エンジニアが主役の会社です。',
            'business_description' => '求人マッチングサービスを開発しています。',
            'culture' => '週1回の勉強会があります。',
            'founded_year' => 2015,
            'member_count' => 42,
            'prefecture' => 'tokyo',
            'address_line' => '渋谷区1-2-3',
            'website_url' => 'https://example.com',
            'tech_stack_ids' => [],
            'work_style_ids' => [],
        ], $overrides);
    }

    it('updates the company page and replaces the selected tags', function () {
        $company = Company::factory()->create();
        $php = TechStack::factory()->create(['sort_order' => 1]);
        $laravel = TechStack::factory()->create(['sort_order' => 2]);
        $removed = TechStack::factory()->create();
        $remote = WorkStyle::factory()->create();
        $company->techStacks()->attach($removed->id);

        $this->actingAs($company, 'company')
            ->putJson('/api/company/profile', validCompanyProfile([
                'tech_stack_ids' => [$laravel->id, $php->id],
                'work_style_ids' => [$remote->id],
            ]))
            ->assertOk()
            ->assertJsonPath('data.name', '株式会社テックマッチ')
            ->assertJsonPath('data.prefecture', ['value' => 'tokyo', 'label' => '東京'])
            ->assertJsonPath('data.tech_stacks.0.id', $php->id)
            ->assertJsonPath('data.tech_stacks.1.id', $laravel->id);

        expect($company->fresh())
            ->member_count->toBe(42)
            ->and($company->techStacks()->pluck('tech_stacks.id')->sort()->values()->all())->toBe([$php->id, $laravel->id])
            ->and($company->workStyles()->pluck('work_styles.id')->all())->toBe([$remote->id]);
    });

    it('clears the optional fields and tags when they are sent empty', function () {
        $company = Company::factory()->withProfile()->create();
        $company->techStacks()->attach(TechStack::factory()->create()->id);

        $this->actingAs($company, 'company')
            ->putJson('/api/company/profile', [
                'name' => $company->name,
                'introduction' => null,
                'founded_year' => null,
                'prefecture' => null,
                'tech_stack_ids' => [],
                'work_style_ids' => [],
            ])
            ->assertOk()
            ->assertJsonPath('data.introduction', null)
            ->assertJsonPath('data.prefecture', null)
            ->assertJsonCount(0, 'data.tech_stacks');
    });

    it('returns 422 with Japanese messages for invalid input', function (array $input, string $field, string $message) {
        $this->travelTo('2026-10-20');

        $this->actingAs(Company::factory()->create(), 'company')
            ->putJson('/api/company/profile', validCompanyProfile($input))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([$field => $message]);
    })->with([
        'remote as location' => [['prefecture' => 'remote'], 'prefecture', '選択された所在地(都道府県)は無効です。'],
        'future founded year' => [['founded_year' => 2027], 'founded_year', '設立年は、2026以下の数値である必要があります。'],
        'introduction too long' => [['introduction' => str_repeat('あ', 201)], 'introduction', '紹介文の文字数は、200文字以下である必要があります。'],
        'unknown tech stack' => [['tech_stack_ids' => [999999]], 'tech_stack_ids.0', '選択された技術スタックは、有効ではありません。'],
        'missing company name' => [['name' => ''], 'name', '会社名は必須項目です。'],
        'tags not an array' => [['work_style_ids' => 'フルリモート'], 'work_style_ids', '働き方には、配列を指定してください。'],
    ]);

    it('returns 401 when not logged in', function () {
        $this->putJson('/api/company/profile', validCompanyProfile())->assertUnauthorized();
    });
});

it('does not include tech stacks in /me', function () {
    $company = Company::factory()->create();
    $company->techStacks()->attach(TechStack::factory()->create()->id);

    $this->actingAs($company, 'company')
        ->getJson('/api/company/me')
        ->assertOk()
        ->assertJsonMissingPath('data.tech_stacks');
});
