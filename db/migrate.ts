// ./db/migrate.ts
import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import fs from "fs/promises";
import * as schema from "../src/schema.ts";

async function loadDatabase(path: string) {
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

  return { db, save, database, shouldInit };
}

async function main() {
  console.log('Running migrations...');
  const { save, database, shouldInit } = await loadDatabase("./db/sqlite.db");

  if (shouldInit) {
    console.log('Initializing database...');
  }

  const migrationFiles = await fs.readdir('./drizzle');
  const sqlMigrations = migrationFiles.filter(file => file.endsWith('.sql'));

  for (const migrationFile of sqlMigrations) {
    console.log(`Applying migration: ${migrationFile}`);
    const migrationSql = await fs.readFile(`./drizzle/${migrationFile}`, 'utf8');
    database.exec(migrationSql);
  }

  await save();
  console.log('Migrations completed');
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});