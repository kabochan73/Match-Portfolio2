<?php

namespace App\Models;

use App\Enums\Prefecture;
use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * 企業。1社1アカウントで、ログインの主体を兼ねる(求職者のUserとは別のガードで認証する)
 */
#[Fillable([
    'name',
    'email',
    'password',
    'avatar_path',
    'introduction',
    'business_description',
    'culture',
    'founded_year',
    'member_count',
    'prefecture',
    'address_line',
    'website_url',
])]
#[Hidden(['password', 'remember_token'])]
class Company extends Authenticatable
{
    /** @use HasFactory<CompanyFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'founded_year' => 'integer',
            'member_count' => 'integer',
            'prefecture' => Prefecture::class,
        ];
    }
}
