import { join } from "node:path";
import getAppDataPath from "appdata-path";

//export const APP_DATA_PATH = join(app.getPath("appData"), "leafr");
export const APP_DATA_PATH = getAppDataPath("leafr");
export const CACHE_PATH = join(APP_DATA_PATH, "App Cache");
export const COVER_IMAGE_PATH = join(APP_DATA_PATH, "Covers");
export const LOGS_PATH = join(APP_DATA_PATH, "Logs");
export const TEMP_PATH = join(APP_DATA_PATH, "Temp");

export const DATABASE_PATH = join(APP_DATA_PATH, "Database");
export const DATABASE_FILE = join(DATABASE_PATH, "leafr.db");

export const PROTOCOL_NAME = "leafr";
