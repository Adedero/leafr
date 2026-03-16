import { drizzle } from "drizzle-orm/libsql";
import { DATABASE_FILE } from "../utils/constants";
import * as schema from "./schema";
import { omit } from "../utils/omit";

const db = drizzle(`file:${DATABASE_FILE}`, {
  schema: { ...omit(schema, ["relations"]) },
  relations: { ...schema.relations }
});

export default db;
export const table = { ...omit(schema, ["relations"]) };
