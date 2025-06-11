import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
