import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

  return httpServer;
}
