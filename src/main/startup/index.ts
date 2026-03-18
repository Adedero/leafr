import { initializeBooks } from "./books";
import { initDirectories } from "./directories";

export default async function startup() {
  initDirectories();
  await initializeBooks();
  // await watchLibDir();
}
