import type { Express } from "express";
import { createServer, type Server } from "http";
import { fetchAdaptySummary } from "./adapty";
import { getRifles } from "./rifles";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Admin API: rifles list (for dashboard)
  app.get("/admin/api/rifles", (req, res) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const size = req.query.size ? Number(req.query.size) : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const sortDir = (req.query.sortDir === "asc" || req.query.sortDir === "desc") ? req.query.sortDir : undefined;
    const data = getRifles({ page, size, sortBy, sortDir });
    res.json(data);
  });

  /**
   * Adapty subscription metrics (Export Analytics API). Requires ADAPTY_SECRET_API_KEY.
   * Production Ballistiq API should expose the same path with admin auth; until then,
   * point the admin console at this server via VITE_ADAPTY_API_BASE_URL or implement on the Java API.
   */
  app.get("/admin/api/adapty/summary", async (req, res) => {
    const apiKey = process.env.ADAPTY_SECRET_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        ok: false as const,
        error: "not_configured",
        detail:
          "Set ADAPTY_SECRET_API_KEY (Adapty Dashboard → App settings → Secret API key).",
      });
    }
    const timezone = typeof req.query.timezone === "string" ? req.query.timezone : undefined;
    const dateFrom = typeof req.query.from === "string" ? req.query.from : undefined;
    const dateTo = typeof req.query.to === "string" ? req.query.to : undefined;
    const result = await fetchAdaptySummary({
      apiKey,
      timezone,
      dateFrom,
      dateTo,
    });
    if (!result.ok) {
      return res.status(502).json(result);
    }
    res.json(result);
  });

  return httpServer;
}
