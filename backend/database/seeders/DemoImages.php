<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\Geometry\Factories\CircleFactory;
use Intervention\Image\Geometry\Factories\RectangleFactory;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

/**
 * デモ用の画像。写真の代わりに、色と図形だけの画像を描いて保存する(外部の素材を使わないため、権利の心配がない)
 */
class DemoImages
{
    /**
     * ロゴ。背景色の正方形に、図形の色の丸を描く
     *
     * @return string 保存先の相対パス
     */
    public function logo(string $background, string $shape): string
    {
        $image = ImageManager::usingDriver(GdDriver::class)
            ->createImage(400, 400)
            ->fill($background)
            ->drawCircle(fn (CircleFactory $circle) => $circle->at(200, 200)->radius(110)->background($shape));

        return $this->store($image, 'avatars/companies');
    }

    /**
     * 写真の代わりの16:9の画像。variantで図形の並びを変え、同じ色でも違う画像に見えるようにする
     *
     * @return string 保存先の相対パス
     */
    public function photo(string $directory, string $background, string $shape, int $variant = 0): string
    {
        $image = ImageManager::usingDriver(GdDriver::class)
            ->createImage(1600, 900)
            ->fill($background);

        match ($variant % 3) {
            0 => $image
                ->drawRectangle(fn (RectangleFactory $rectangle) => $rectangle->at(160, 180)->size(560, 540)->background($shape))
                ->drawCircle(fn (CircleFactory $circle) => $circle->at(1150, 450)->radius(240)->background($shape)),
            1 => $image
                ->drawCircle(fn (CircleFactory $circle) => $circle->at(450, 450)->radius(280)->background($shape))
                ->drawRectangle(fn (RectangleFactory $rectangle) => $rectangle->at(900, 260)->size(520, 380)->background($shape)),
            default => $image
                ->drawRectangle(fn (RectangleFactory $rectangle) => $rectangle->at(140, 140)->size(1320, 160)->background($shape))
                ->drawRectangle(fn (RectangleFactory $rectangle) => $rectangle->at(140, 380)->size(820, 160)->background($shape))
                ->drawRectangle(fn (RectangleFactory $rectangle) => $rectangle->at(140, 620)->size(1080, 160)->background($shape)),
        };

        return $this->store($image, $directory);
    }

    private function store(ImageInterface $image, string $directory): string
    {
        $path = $directory.'/'.Str::random(40).'.webp';

        Storage::put($path, (string) $image->encode(new WebpEncoder(quality: 80)));

        return $path;
    }
}
