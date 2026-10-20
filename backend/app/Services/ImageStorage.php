<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageInterface;

/**
 * アップロード画像の保存・削除・URL取得をまとめたクラス(アイコン・ロゴ・ギャラリーで共通利用する)。
 *
 * - 読み込み時にスマホ写真の向き(回転情報)を補正する(Intervention Imageの既定の動作)
 * - 指定サイズに収まるよう縮小する(小さい画像を拡大はしない)
 * - WebPに変換し、EXIF(撮影日時・位置情報など)を削除して保存する
 * - 保存先はFILESYSTEM_DISK(ローカルはpublic、本番はRailway Bucket)
 */
class ImageStorage
{
    private const WEBP_QUALITY = 80;

    /**
     * 縦横比を保ったまま、指定の幅・高さに収まるよう縮小して保存する(ギャラリー用)
     *
     * @return string 保存先の相対パス
     */
    public function storeResized(UploadedFile $file, string $directory, int $maxWidth, int $maxHeight): string
    {
        $image = $this->decode($file)->scaleDown($maxWidth, $maxHeight);

        return $this->store($image, $directory);
    }

    /**
     * 中央を正方形に切り抜き、指定サイズ以下に縮小して保存する(アイコン・ロゴ用)
     *
     * @return string 保存先の相対パス
     */
    public function storeSquare(UploadedFile $file, string $directory, int $size): string
    {
        $image = $this->decode($file)->coverDown($size, $size);

        return $this->store($image, $directory);
    }

    /**
     * 保存した画像を削除する。パスがnullなら何もしない
     */
    public function delete(?string $path): void
    {
        if ($path === null) {
            return;
        }

        Storage::delete($path);
    }

    /**
     * 画面にそのまま表示できるURLを返す。パスがnullならnull。
     * 保存先によってURLの作り方が変わりうるため、URLの組み立てはこのメソッドに集約する
     */
    public function url(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        return Storage::url($path);
    }

    private function decode(UploadedFile $file): ImageInterface
    {
        return ImageManager::usingDriver(GdDriver::class)->decodePath($file->getRealPath());
    }

    /**
     * WebPに変換して保存する。ファイル名は推測されないようランダムにする(元のファイル名は使わない)
     */
    private function store(ImageInterface $image, string $directory): string
    {
        $path = $directory.'/'.Str::random(40).'.webp';

        Storage::put($path, (string) $image->encode(new WebpEncoder(quality: self::WEBP_QUALITY, strip: true)));

        return $path;
    }
}
