import { LOGS_PATH } from "../constants.js";
import { Logger } from "./lib/logger.js";

const logger = Logger.getInstance({ rootDir: LOGS_PATH });

export default logger;
export { Logger };
export type { LoggerOptions, LoggerError } from "./types/logger.type.js";
