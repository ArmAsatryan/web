#!/usr/bin/env node
/**
 * When the deploy platform runs "npm run dev" (e.g. Cloudflare Pages), run build
 * and exit so the step completes. Locally, start the dev server as usual.
 */
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isCI = process.env.CI === "true" || process.env.CF_PAGES === "1";

if (isCI) {
  console.log("[dev-or-build] CI/Pages detected: running build and exiting...");
  const r = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    shell: true,
  });
  process.exit(r.status ?? 0);
}

const tsx = spawnSync(
  "npx",
  ["tsx", "server/index.ts"],
  {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, NODE_ENV: "development" },
    shell: true,
  }
);
process.exit(tsx.status ?? 0);
