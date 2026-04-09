import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Prefer the web app env file when running from repo root, fallback to legacy packages/.env.
dotenv.config({ path: "../../apps/web/.env.local", override: false });

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "../.env", override: false });
}

const migrationUrl =
  process.env.DATABASE_MIGRATE_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DATABASE_MIGRATE_URL or DATABASE_URL is required for Drizzle migrations.",
  );
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
});
