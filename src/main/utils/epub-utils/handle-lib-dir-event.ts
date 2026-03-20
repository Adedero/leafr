import syncBooks from "../../handlers/books/sync-books";
import { isDirEmpty } from "../is-dir-empty";

export default async function handleLibDirAdd({
  path,
  rootDir
}: {
  path: string;
  rootDir: string;
}) {
  if (!path) {
    return;
  }
  const isEmpty = await isDirEmpty(path);
  if (isEmpty) {
    return;
  }

  syncBooks(rootDir).then(() => {});
}
