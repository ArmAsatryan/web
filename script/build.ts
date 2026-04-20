import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  const adminDir = path.resolve(process.cwd(), "admin-console");
  if (existsSync(adminDir)) {
    console.log("installing admin-console dependencies...");
    execSync("npm install", { cwd: adminDir, stdio: "inherit" });
    console.log("building admin-console...");
    execSync("npm run build", { cwd: adminDir, stdio: "inherit" });
  }

  const redirectsSrc = path.resolve(process.cwd(), "script/cloudflare-pages-redirects");
  if (existsSync(redirectsSrc)) {
    const body = await readFile(redirectsSrc, "utf-8");
    const distPublic = path.resolve(process.cwd(), "dist/public");
    await mkdir(distPublic, { recursive: true });
    await writeFile(path.join(distPublic, "_redirects"), body, "utf-8");
    console.log("wrote dist/public/_redirects (Cloudflare Pages SPA: admin-console + client)");
  }

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
