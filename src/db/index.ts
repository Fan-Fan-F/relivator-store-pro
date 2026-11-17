import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { DB_DEV_LOGGER } from "~/app";

import * as schema from "./schema";

const defaultDbUrl = "postgresql://postgres:postgres@localhost:5432/relivator";
const databaseUrl = process.env.DATABASE_URL || defaultDbUrl;

/**
 * Caches the database connection in development to
 * prevent creating a new connection on every HMR update.
 */
type DbConnection = ReturnType<typeof postgres>;
const globalForDb = globalThis as unknown as {
  conn?: DbConnection;
};

export const conn: DbConnection =
  globalForDb.conn ??
  postgres(databaseUrl, {
    connect_timeout: 5,
    idle_timeout: 20,
    max: 10,
    onnotice: () => {},
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

// Database connection instance
export const db = drizzle(conn, {
  logger: DB_DEV_LOGGER && process.env.NODE_ENV !== "production",
  schema,
});
