import "dotenv/config";

import { execSync } from "node:child_process";

export default async function globalSetup() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL is not set");
  }

  execSync("npm run db:seed", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
    },
  });
}