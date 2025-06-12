import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const cargas = pgTable("cargas", {
  id: serial("id").primaryKey(),
  hora: text("hora").notNull(),
  viagem: text("viagem").notNull(),
  frota: text("frota").notNull(),
  prebox: text("prebox").notNull(),
  boxd: text("boxd").notNull(),
  status: text("status").notNull(),
});

export const insertCargaSchema = createInsertSchema(cargas).pick({
  hora: true,
  viagem: true,
  frota: true,
  prebox: true,
  boxd: true,
  status: true,
});

export type InsertCarga = z.infer<typeof insertCargaSchema>;
export type Carga = typeof cargas.$inferSelect;

export const alteracoes = pgTable("alteracoes", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  dados: text("dados").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertAlteracaoSchema = createInsertSchema(alteracoes).pick({
  tipo: true,
  dados: true,
  timestamp: true,
});

export type InsertAlteracao = z.infer<typeof insertAlteracaoSchema>;
export type Alteracao = typeof alteracoes.$inferSelect;

export const agendamentos = pgTable("agendamentos", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  data: text("data").notNull(), // ISO string ou data/hora
  usuario_id: integer("usuario_id").notNull().references(() => users.id),
  status: text("status").notNull(), // pendente, confirmado, cancelado
});

export const insertAgendamentoSchema = createInsertSchema(agendamentos).pick({
  titulo: true,
  descricao: true,
  data: true,
  usuario_id: true,
  status: true,
});

export type InsertAgendamento = z.infer<typeof insertAgendamentoSchema>;
export type Agendamento = typeof agendamentos.$inferSelect;
