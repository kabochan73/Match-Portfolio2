<?php

namespace App\Enums;

/**
 * 雇用形態。求職者の職歴と求人の両方で使う
 */
enum EmploymentType: string
{
    case FullTime = 'full_time';
    case Contract = 'contract';
    case PartTime = 'part_time';
    case Freelance = 'freelance';
    case Internship = 'internship';

    /**
     * 画面に表示する日本語の名称
     */
    public function label(): string
    {
        return match ($this) {
            self::FullTime => '正社員',
            self::Contract => '契約社員',
            self::PartTime => 'アルバイト',
            self::Freelance => '業務委託',
            self::Internship => 'インターン',
        };
    }
}
