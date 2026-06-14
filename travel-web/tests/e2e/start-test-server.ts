import "dotenv/config";

import { spawn } from "node:child_process";
import { resolve } from "node:path";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is not set");
}

const child = spawn(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), "dev", "-p", "3100"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
      PORT: "3100",
    },
  },
);

const shutdown = () => {
  if (!child.killed) {
    child.kill();
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
child.on("exit", (code) => {
  process.exit(code ?? 0);
});