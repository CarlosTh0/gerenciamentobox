import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { runMigrations } from "./migrate";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  app.post("/run-migrations", async (req, res) => {
    try {
      await runMigrations();
      res.json({ success: true, message: "Migrations ran successfully" });
    } catch (err) {
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
