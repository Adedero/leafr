import { rename, copyFile, unlink, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { pathExists } from "./path-exists";

export interface MoveFileOptions {
  overwrite?: boolean;
}

export async function moveFile(
  src: string,
  dest: string,
  options: MoveFileOptions = {}
): Promise<void> {
  const { overwrite = false } = options;

  if (!(await pathExists(src))) {
    throw new Error("Source file does not exist");
  }

  const destExists = await pathExists(dest);
  if (destExists && !overwrite) {
    throw new Error("Destination file already exists");
  }

  await mkdir(dirname(dest), { recursive: true });

  try {
    await rename(src, dest);
  } catch (error: any) {
    if (error.code === "EXDEV") {
      // cross-device — if dest exists and overwrite, remove first
      if (destExists && overwrite) await unlink(dest);
      await copyFile(src, dest);
      await unlink(src);
    } else {
      throw error;
    }
  }
}
