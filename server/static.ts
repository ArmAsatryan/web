import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const adminPath = path.join(distPath, "admin-console");
  if (fs.existsSync(adminPath)) {
    // Serve index.html directly for /admin-console and /admin-console/ (no redirect to avoid loop)
    app.get("/admin-console", (_req, res) => {
      res.sendFile(path.join(adminPath, "index.html"));
    });
    app.get("/admin-console/", (_req, res) => {
      res.sendFile(path.join(adminPath, "index.html"));
    });
    app.use(
      "/admin-console",
      express.static(adminPath, { index: false, redirect: false }),
    );
    // SPA fallback: any /admin-console/* not served by static (e.g. /admin-console/login) → admin index.html
    app.use("/admin-console", (_req, res) => {
      res.sendFile(path.join(adminPath, "index.html"));
    });
  } else {
    app.get("/admin-console", (_req, res) => {
      res
        .status(503)
        .type("html")
        .send(
          `<h1>Admin console not built</h1><p>Run from project root: <code>npm run build:admin</code> then restart the server.</p>`,
        );
    });
    app.get("/admin-console/", (_req, res) => {
      res
        .status(503)
        .type("html")
        .send(
          `<h1>Admin console not built</h1><p>Run from project root: <code>npm run build:admin</code> then restart the server.</p>`,
        );
    });
  }

  // Main app static: skip /admin-console so it never 301s the directory
  app.use((req, res, next) => {
    if (req.path.startsWith("/admin-console")) return next();
    express.static(distPath)(req, res, next);
  });

  // fall through to index.html if the file doesn't exist (main app SPA)
  app.use((req, res) => {
    if (req.path.startsWith("/admin-console")) {
      if (fs.existsSync(adminPath)) {
        return res.sendFile(path.join(adminPath, "index.html"));
      }
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
