import { defineConfig } from "drizzle-kit";
import { DATABASE_FILE } from "./src/main/utils/constants";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/main/database/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${DATABASE_FILE}`
  }
});
