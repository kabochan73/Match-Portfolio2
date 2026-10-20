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

it('does not include tech stacks in /me', function () {
    $company = Company::factory()->create();
    $company->techStacks()->attach(TechStack::factory()->create()->id);

    $this->actingAs($company, 'company')
        ->getJson('/api/company/me')
        ->assertOk()
        ->assertJsonMissingPath('data.tech_stacks');
});
