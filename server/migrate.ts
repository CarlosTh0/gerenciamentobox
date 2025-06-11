import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "./migrations" });
  await pool.end();
}
