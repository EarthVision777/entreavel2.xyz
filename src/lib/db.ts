import "server-only";

import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

const globalForDb = globalThis as unknown as {
  pgPool?: pg.Pool;
  pglite?: Promise<PGlite>;
};

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    globalForDb.pgPool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
    });
    return (await globalForDb.pgPool.query(text, params)).rows as T[];
  }

  globalForDb.pglite ??= startLocal().catch((error: unknown) => {
    globalForDb.pglite = undefined;
    throw error;
  });
  const result = await (await globalForDb.pglite).query<T>(text, params);
  return result.rows;
}

async function startLocal(): Promise<PGlite> {
  const dir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(path.dirname(dir), { recursive: true });
  const db = new PGlite(dir);
  await db.exec(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);
  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await readdir(migrationsDir).catch(() => [] as string[]))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const done = new Set(
    (
      await db.query<{ name: string }>("select name from schema_migrations")
    ).rows.map((row) => row.name),
  );
  for (const file of files) {
    if (done.has(file)) continue;
    await db.exec(await readFile(path.join(migrationsDir, file), "utf8"));
    await db.query("insert into schema_migrations (name) values ($1)", [file]);
  }
  return db;
}
