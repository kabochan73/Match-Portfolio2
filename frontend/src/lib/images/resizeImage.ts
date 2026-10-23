/** 長い辺をこの大きさまで縮小してから送る(サーバーでさらに1600px・ロゴは400pxに整える) */
const MAX_EDGE = 2400;

/** これ以下の大きさで、長い辺も上限以内なら、縮小せずにそのまま送る */
const PASS_THROUGH_BYTES = 2 * 1024 * 1024;

const JPEG_QUALITY = 0.9;

/**
 * 画像をブラウザで縮小する。
 * スマホで撮った写真は5MBを超えやすく、そのまま送ると上限で弾かれたり、サーバーの画像処理でメモリが足りなくなったりするため。
 * PNGは透過を保つためPNGのまま、それ以外はJPEGにする
 */
export async function resizeImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

  if (scale === 1 && file.size <= PASS_THROUGH_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, JPEG_QUALITY),
  );

  if (!blob) {
    return file;
  }

  const extension = type === "image/png" ? "png" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") || "image";

  return new File([blob], `${name}.${extension}`, { type });
}

/** 選べる画像の形式(Laravelのバリデーションと合わせる) */
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";
