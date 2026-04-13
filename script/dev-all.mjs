#!/usr/bin/env node
/**
 * Run the main app and admin-console Vite dev servers together (local only).
 * Avoids an extra dependency so `npm ci` stays aligned with package-lock.json.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const adminDir = path.join(root, "admin-console");

const opts = (cwd) => ({
  cwd,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "development" },
});

const main = spawn("npm", ["run", "dev"], opts(root));
const admin = spawn("npm", ["run", "dev"], opts(adminDir));

function shutdown(signal) {
  main.kill(signal);
  admin.kill(signal);
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM");
  process.exit(0);
});

main.on("exit", (code, sig) => {
  if (sig) shutdown("SIGTERM");
  else if (code !== 0) admin.kill("SIGTERM");
});
admin.on("exit", (code, sig) => {
  if (sig) shutdown("SIGTERM");
  else if (code !== 0) main.kill("SIGTERM");
});
