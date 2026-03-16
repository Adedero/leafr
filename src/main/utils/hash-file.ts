import { createHash } from "node:crypto";
import { openSync, readSync, statSync, closeSync } from "node:fs";

export function hashFile(filePath: string, chunkSize = 65536): string {
  const fd = openSync(filePath, "r");
  const stat = statSync(filePath);
  const size = stat.size;

  const hash = createHash("sha256");

  const headSize = Math.min(chunkSize, size);
  const tailSize = Math.min(chunkSize, size);

  const headBuffer = Buffer.alloc(headSize);
  const tailBuffer = Buffer.alloc(tailSize);

  readSync(fd, headBuffer, 0, headSize, 0);

  if (size > chunkSize) {
    const tailStart = size - tailSize;
    readSync(fd, tailBuffer, 0, tailSize, tailStart);
  }

  closeSync(fd);

  hash.update(headBuffer);

  if (size > chunkSize) {
    hash.update(tailBuffer);
  }

  hash.update(size.toString());

  return hash.digest("hex");
}
