import { existsSync, mkdirSync } from "node:fs";
import { watch } from "chokidar";
import {
  CACHE_PATH,
  COVER_IMAGE_PATH,
  DATABASE_PATH,
  LOGS_PATH,
  TEMP_PATH
} from "../utils/constants";
import getLibPath from "../utils/get-lib-path";
import handleLibDirEvent from "../utils/epub-utils/handle-lib-dir-event";
import logger from "../utils/logger";
import handleFileAdd from "../utils/epub-utils/handle-file-add";
import handleFileUnlink from "../utils/epub-utils/handle-file-unlink";
import emit from "../utils/emit";

export function initDirectories() {
  const allPaths = [
    DATABASE_PATH,
    LOGS_PATH,
    COVER_IMAGE_PATH,
    TEMP_PATH,
    CACHE_PATH
  ];
  for (const path of allPaths) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
}

/**
 * Handles updating books when they are modified, deleted, or renamed.
 */

export async function watchLibDir() {
  const dir = await getLibPath();

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const watcher = watch(dir, {
    ignored: (path, stats) => !!stats?.isFile() && !path.endsWith(".epub"),
    persistent: true,
    ignoreInitial: true
  });

  watcher.on("add", (path) => {
    console.log("new file: ", path);
    handleFileAdd({ filePath: path, rootDir: dir }).then(() => {
      emit("file:add", null);
    });
  });
  watcher.on("change", (path) => {
    handleFileAdd({ filePath: path, rootDir: dir }).then(() => {
      emit("file:change", null);
    });
  });
  watcher.on("unlink", (path) => {
    handleFileUnlink(path);
    emit("file:unlink", null);
  });

  watcher.on("addDir", (path) => {
    handleLibDirEvent({ path, rootDir: dir });
    emit("lib-dir:add", null);
  });
  watcher.on("unlinkDir", (path) => {
    handleLibDirEvent({ path, rootDir: dir });
    emit("lib-dir:unlink", null);
  });

  watcher.on("error", (err) => {
    logger.error("Error watching library directory", err);
  });

  return watcher;
}
