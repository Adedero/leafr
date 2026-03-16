import { existsSync, mkdirSync } from "node:fs";
import {
  CACHE_PATH,
  COVER_IMAGE_PATH,
  DATABASE_PATH,
  LOGS_PATH,
  TEMP_PATH
} from "../utils/constants";

export function initDirectories() {
  const allPaths = [DATABASE_PATH, LOGS_PATH, COVER_IMAGE_PATH, TEMP_PATH, CACHE_PATH];
  for (const path of allPaths) {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
}
