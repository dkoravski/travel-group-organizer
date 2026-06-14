const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "../..");
const statePath = path.join(rootDir, ".jest-integration-server.json");

module.exports = async () => {
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
};
