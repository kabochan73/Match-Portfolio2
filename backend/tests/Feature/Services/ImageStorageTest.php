<?php

use App\Services\ImageStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * 保存された画像の幅・高さ・形式を読み取る
 *
 * @return array{0: int, 1: int, mime: string}
 */
function storedImageInfo(string $path): array
{
    $info = getimagesizefromstring(Storage::get($path));

    return [$info[0], $info[1], 'mime' => $info['mime']];
}

describe('storeResized', function () {
    it('scales a large image down to fit within the limits as WebP', function () {
        Storage::fake();

        $path = app(ImageStorage::class)->storeResized(
            UploadedFile::fake()->image('office.jpg', 3000, 2000),
            'company-images',
            1600,
            1200,
        );

        expect($path)->toStartWith('company-images/')->toEndWith('.webp');
        expect(storedImageInfo($path))->toBe([1600, 1067, 'mime' => 'image/webp']);
    });

    it('does not enlarge a small image', function () {
        Storage::fake();

        $path = app(ImageStorage::class)->storeResized(
            UploadedFile::fake()->image('small.png', 300, 200),
            'company-images',
            1600,
            1200,
        );

        expect(storedImageInfo($path))->toBe([300, 200, 'mime' => 'image/webp']);
    });

    it('does not use the original file name', function () {
        Storage::fake();

        $path = app(ImageStorage::class)->storeResized(
            UploadedFile::fake()->image('my-secret-name.jpg', 100, 100),
            'company-images',
            1600,
            1200,
        );

        expect($path)->not->toContain('my-secret-name');
    });
});

describe('storeSquare', function () {
    it('crops the center to a square and scales it down', function () {
        Storage::fake();

        $path = app(ImageStorage::class)->storeSquare(
            UploadedFile::fake()->image('avatar.jpg', 1000, 600),
            'avatars',
            400,
        );

        expect(storedImageInfo($path))->toBe([400, 400, 'mime' => 'image/webp']);
    });
});

describe('delete', function () {
    it('deletes the stored image', function () {
        Storage::fake();
        $path = app(ImageStorage::class)->storeSquare(UploadedFile::fake()->image('a.jpg', 100, 100), 'avatars', 400);

        app(ImageStorage::class)->delete($path);

        Storage::assertMissing($path);
    });

    it('does nothing when the path is null', function () {
        Storage::fake();

        app(ImageStorage::class)->delete(null);

        expect(Storage::allFiles())->toBe([]);
    });
});

describe('url', function () {
    it('returns a public URL for the stored path', function () {
        Storage::fake();

        expect(app(ImageStorage::class)->url('avatars/abc.webp'))->toEndWith('/avatars/abc.webp');
    });

    it('returns null when the path is null', function () {
        expect(app(ImageStorage::class)->url(null))->toBeNull();
    });
});
