import { join } from "node:path";
import { COVER_IMAGE_PATH } from "../constants";
import type EPub from "epub";

/** Extract cover image from epub and save to disk, returns saved path or "" */
export async function extractCover(
  epub: EPub,
  fileHash: string
): Promise<{ path: string; data: Buffer } | null> {
  const mime = await import("mime");
  try {
    const cover = await epub.getImage((epub.metadata.cover as string) || "cover");
    const ext = mime.default.getExtension(cover.mimeType) || "jpg";
    const coverImagePath = join(COVER_IMAGE_PATH, `${fileHash}.${ext}`);
    return {
      path: coverImagePath,
      data: cover.data
    };
  } catch {
    return null;
  }
}
