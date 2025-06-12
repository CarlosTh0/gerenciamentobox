import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { runMigrations } from "./migrate";
import {
  getAllCargas,
  createCarga,
  updateCarga,
  deleteCarga,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllAlteracoes,
  createAlteracao,
  clearAlteracoes,
  getAllAgendamentos,
  getAgendamentoById,
  createAgendamento,
  updateAgendamento,
  deleteAgendamento,
} from "./db";

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

  // CRUD endpoints para cargas
  app.get("/api/cargas", async (req, res) => {
    const cargas = await getAllCargas();
    res.json(cargas);
  });

  app.post("/api/cargas", async (req, res) => {
    try {
      const carga = await createCarga(req.body);
      res.status(201).json(carga);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.put("/api/cargas/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const carga = await updateCarga(id, req.body);
      if (!carga) return res.status(404).json({ error: "Carga não encontrada" });
      res.json(carga);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.delete("/api/cargas/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await deleteCarga(id);
      if (!ok) return res.status(404).json({ error: "Carga não encontrada" });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  // CRUD endpoints para usuários
  app.get("/api/usuarios", async (req, res) => {
    const usuarios = await getAllUsers();
    res.json(usuarios);
  });

  app.post("/api/usuarios", async (req, res) => {
    try {
      const usuario = await createUser(req.body);
      res.status(201).json(usuario);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.put("/api/usuarios/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const usuario = await updateUser(id, req.body);
      if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
      res.json(usuario);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.delete("/api/usuarios/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await deleteUser(id);
      if (!ok) return res.status(404).json({ error: "Usuário não encontrado" });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  // Endpoints para alterações
  app.get("/api/alteracoes", async (req, res) => {
    const alteracoes = await getAllAlteracoes();
    res.json(alteracoes);
  });

  app.post("/api/alteracoes", async (req, res) => {
    try {
      const { tipo, dados } = req.body;
      const alteracao = await createAlteracao(tipo, dados);
      res.status(201).json(alteracao);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.delete("/api/alteracoes", async (req, res) => {
    await clearAlteracoes();
    res.json({ success: true });
  });

  // CRUD endpoints para agendamentos
  app.get("/api/agendamentos", async (req, res) => {
    const agendamentos = await getAllAgendamentos();
    res.json(agendamentos);
  });

  app.get("/api/agendamentos/:id", async (req, res) => {
    const id = Number(req.params.id);
    const agendamento = await getAgendamentoById(id);
    if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado" });
    res.json(agendamento);
  });

  app.post("/api/agendamentos", async (req, res) => {
    try {
      const agendamento = await createAgendamento(req.body);
      res.status(201).json(agendamento);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.put("/api/agendamentos/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const agendamento = await updateAgendamento(id, req.body);
      if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado" });
      res.json(agendamento);
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  app.delete("/api/agendamentos/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const ok = await deleteAgendamento(id);
      if (!ok) return res.status(404).json({ error: "Agendamento não encontrado" });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: String(err) });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
