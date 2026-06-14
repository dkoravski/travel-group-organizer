require("dotenv/config");

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "../..");
const statePath = path.join(rootDir, ".jest-integration-server.json");
const serverLogPath = path.join(rootDir, ".jest-integration-server.log");
const port = process.env.TEST_SERVER_PORT || "3210";
const baseUrl = `http://127.0.0.1:${port}`;

function stopPreviousServer() {
  if (!fs.existsSync(statePath)) {
    return;
  }

  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

  if (state.pid) {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(state.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      try {
        process.kill(Number(state.pid), "SIGTERM");
      } catch {
        // Server already stopped.
      }
    }
  }

  fs.rmSync(statePath, { force: true });
}

function run(command, args, env, options = {}) {
  const stdio = options.stdio || "pipe";
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio,
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(" ")}`,
        result.error?.message,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

async function waitForServer() {
  const deadline = Date.now() + 45000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/docs`);

      if (response.ok) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  throw new Error(`Next test server did not start at ${baseUrl}: ${lastError}`);
}

module.exports = async () => {
  stopPreviousServer();

  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL is required for integration tests.");
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL === testDatabaseUrl) {
    throw new Error(
      "Refusing to run integration tests because TEST_DATABASE_URL equals DATABASE_URL.",
    );
  }

  const env = {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    JWT_SECRET: process.env.JWT_SECRET || "integration-test-secret",
    NEXT_TELEMETRY_DISABLED: "1",
    INTEGRATION_BASE_URL: baseUrl,
  };

  run("npx", ["drizzle-kit", "migrate"], env);
  run("npx", ["tsx", "src/db/seed.ts"], env);
  run("npx", ["next", "build"], env, { stdio: "inherit" });

  fs.writeFileSync(serverLogPath, "", "utf8");
  const log = fs.openSync(serverLogPath, "a");
  const server = spawn(
    "npx",
    ["next", "start", "--hostname", "127.0.0.1", "--port", port],
    {
      cwd: rootDir,
      env,
      detached: false,
      shell: process.platform === "win32",
      stdio: ["ignore", log, log],
      windowsHide: true,
    },
  );

  fs.writeFileSync(
    statePath,
    JSON.stringify({ pid: server.pid, baseUrl, serverLogPath }, null, 2),
  );

  await waitForServer();
};
