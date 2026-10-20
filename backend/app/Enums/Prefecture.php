<?php

namespace App\Enums;

/**
 * 都道府県+リモート。企業の所在地と求人の勤務地で共通利用する。
 * 企業の所在地ではRemoteを選べないよう、バリデーションで除外する(Rule::enum(...)->except(...))。
 * 値は検索条件としてURLに載せるため英字にしている(例: /jobs?location=tokyo)
 */
enum Prefecture: string
{
    case Hokkaido = 'hokkaido';
    case Aomori = 'aomori';
    case Iwate = 'iwate';
    case Miyagi = 'miyagi';
    case Akita = 'akita';
    case Yamagata = 'yamagata';
    case Fukushima = 'fukushima';
    case Ibaraki = 'ibaraki';
    case Tochigi = 'tochigi';
    case Gunma = 'gunma';
    case Saitama = 'saitama';
    case Chiba = 'chiba';
    case Tokyo = 'tokyo';
    case Kanagawa = 'kanagawa';
    case Niigata = 'niigata';
    case Toyama = 'toyama';
    case Ishikawa = 'ishikawa';
    case Fukui = 'fukui';
    case Yamanashi = 'yamanashi';
    case Nagano = 'nagano';
    case Gifu = 'gifu';
    case Shizuoka = 'shizuoka';
    case Aichi = 'aichi';
    case Mie = 'mie';
    case Shiga = 'shiga';
    case Kyoto = 'kyoto';
    case Osaka = 'osaka';
    case Hyogo = 'hyogo';
    case Nara = 'nara';
    case Wakayama = 'wakayama';
    case Tottori = 'tottori';
    case Shimane = 'shimane';
    case Okayama = 'okayama';
    case Hiroshima = 'hiroshima';
    case Yamaguchi = 'yamaguchi';
    case Tokushima = 'tokushima';
    case Kagawa = 'kagawa';
    case Ehime = 'ehime';
    case Kochi = 'kochi';
    case Fukuoka = 'fukuoka';
    case Saga = 'saga';
    case Nagasaki = 'nagasaki';
    case Kumamoto = 'kumamoto';
    case Oita = 'oita';
    case Miyazaki = 'miyazaki';
    case Kagoshima = 'kagoshima';
    case Okinawa = 'okinawa';
    case Remote = 'remote';

    /**
     * 画面に表示する名称。「都・府・県」は付けない(北海道のみそのまま)
     */
    public function label(): string
    {
        return match ($this) {
            self::Hokkaido => '北海道',
            self::Aomori => '青森',
            self::Iwate => '岩手',
            self::Miyagi => '宮城',
            self::Akita => '秋田',
            self::Yamagata => '山形',
            self::Fukushima => '福島',
            self::Ibaraki => '茨城',
            self::Tochigi => '栃木',
            self::Gunma => '群馬',
            self::Saitama => '埼玉',
            self::Chiba => '千葉',
            self::Tokyo => '東京',
            self::Kanagawa => '神奈川',
            self::Niigata => '新潟',
            self::Toyama => '富山',
            self::Ishikawa => '石川',
            self::Fukui => '福井',
            self::Yamanashi => '山梨',
            self::Nagano => '長野',
            self::Gifu => '岐阜',
            self::Shizuoka => '静岡',
            self::Aichi => '愛知',
            self::Mie => '三重',
            self::Shiga => '滋賀',
            self::Kyoto => '京都',
            self::Osaka => '大阪',
            self::Hyogo => '兵庫',
            self::Nara => '奈良',
            self::Wakayama => '和歌山',
            self::Tottori => '鳥取',
            self::Shimane => '島根',
            self::Okayama => '岡山',
            self::Hiroshima => '広島',
            self::Yamaguchi => '山口',
            self::Tokushima => '徳島',
            self::Kagawa => '香川',
            self::Ehime => '愛媛',
            self::Kochi => '高知',
            self::Fukuoka => '福岡',
            self::Saga => '佐賀',
            self::Nagasaki => '長崎',
            self::Kumamoto => '熊本',
            self::Oita => '大分',
            self::Miyazaki => '宮崎',
            self::Kagoshima => '鹿児島',
            self::Okinawa => '沖縄',
            self::Remote => 'リモート',
        };
    }
}
