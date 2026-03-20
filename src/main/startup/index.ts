import { initializeBooks } from "./books";
import { initDirectories, watchLibDir } from "./directories";

export default async function startup() {
  initDirectories();
  await watchLibDir();
  await initializeBooks();
}
