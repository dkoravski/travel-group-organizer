import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

if (!databaseUrl && !isBuildTime) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(
  neon(databaseUrl || "postgresql://dummy@localhost/dummy"),
  { schema },
);
