import { existsSync, mkdirSync } from "node:fs";
import chokidar from "chokidar";
import {
  CACHE_PATH,
  COVER_IMAGE_PATH,
  DATABASE_PATH,
  LOGS_PATH,
  TEMP_PATH
} from "../utils/constants";
import getLibPath from "../utils/get-lib-path";

export function initDirectories() {
  const allPaths = [DATABASE_PATH, LOGS_PATH, COVER_IMAGE_PATH, TEMP_PATH, CACHE_PATH];
  for (const path of allPaths) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
}

/**
 * Handles updating books when they are modified, deleted, or renamed.
 */

// export async function watchLibDir() {
//   const dir = await getLibPath();

//   const watcher = chokidar.watch(dir, {
//     ignored: (path, stats) => !stats?.isFile() || !path.endsWith(".epub"),
//     persistent: true
//   });

//   watcher.on("add", (path) => {
    
//   })
// }
