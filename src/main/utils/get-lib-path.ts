import db, { table } from "../database";
import { app } from "electron";
import { join } from "node:path";

export default async function getLibPath(): Promise<string> {
  const [settings] = await db
    .select({ libraryPath: table.settings.libraryPath })
    .from(table.settings)
    .limit(1);

  return settings?.libraryPath ?? join(app.getPath("documents"), "Leafr");
}
