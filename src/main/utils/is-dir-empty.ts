import { opendir } from "node:fs/promises";

export async function isDirEmpty(dir: string): Promise<boolean> {
  const d = await opendir(dir);
  const entry = await d.read();
  await d.close();
  return entry === null;
}
