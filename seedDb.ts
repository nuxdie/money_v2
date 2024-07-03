import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import fs from "fs/promises";
import * as schema from "./src/schema.ts";

export async function loadDatabase(path: string) {
  const SQL = await initSqlJs({
    locateFile: (file) => `./public/${file}`,
  });

  let buffer: Buffer | null = null;
  let shouldInit = false;

  try {
    buffer = await fs.readFile(path);
  } catch {
    shouldInit = true;
  }

  const database = new SQL.Database(buffer);
  const db = drizzle(database, { schema });

  async function save() {
    const exportBuffer = database.export();
    await fs.writeFile(path, exportBuffer);
  }

  if (shouldInit) {
    try {
      const initialMigrationSql = await fs.readFile(
        "./drizzle/0000_luxuriant_johnny_blaze.sql",
        "utf8"
      );

      database.exec(initialMigrationSql);
      await save();
    } catch (err) {
      console.error(err);
    }
  }

  return {
    db,
    save,
  };
}


console.log("⌛ Seeding database...");
const { db, save } = await loadDatabase("./sqlite.db");

await db.insert(schema.users).values({ name: "John" });
await db.insert(schema.users).values({ name: "Jane" });

await save();
console.log("✅ Database seeded.");
