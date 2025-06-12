import { cargas, type Carga, type InsertCarga, users, type User, type InsertUser, alteracoes, agendamentos, type Agendamento, type InsertAgendamento } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import pkg from "pg";
const { Pool } = pkg;

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
}

export async function getAllCargas(): Promise<Carga[]> {
  const db = getDb();
  return db.select().from(cargas);
}

export async function createCarga(data: InsertCarga): Promise<Carga> {
  const db = getDb();
  const [created] = await db.insert(cargas).values(data).returning();
  return created;
}

export async function updateCarga(id: number, data: Partial<InsertCarga>): Promise<Carga | null> {
  const db = getDb();
  const [updated] = await db.update(cargas).set(data).where(eq(cargas.id, id)).returning();
  return updated || null;
}

export async function deleteCarga(id: number): Promise<boolean> {
  const db = getDb();
  const deleted = await db.delete(cargas).where(eq(cargas.id, id)).returning();
  return !!deleted.length;
}

export async function getAllUsers(): Promise<User[]> {
  const db = getDb();
  return db.select().from(users);
}

export async function createUser(data: InsertUser): Promise<User> {
  const db = getDb();
  const [created] = await db.insert(users).values(data).returning();
  return created;
}

export async function updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
  const db = getDb();
  const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return updated || null;
}

export async function deleteUser(id: number): Promise<boolean> {
  const db = getDb();
  const deleted = await db.delete(users).where(eq(users.id, id)).returning();
  return !!deleted.length;
}

export async function getAllAlteracoes() {
  const db = getDb();
  return db.select().from(alteracoes);
}

export async function createAlteracao(tipo: string, dados: any) {
  const db = getDb();
  const [created] = await db.insert(alteracoes).values({
    tipo,
    dados: JSON.stringify(dados),
    timestamp: new Date().toISOString(),
  }).returning();
  return created;
}

export async function clearAlteracoes() {
  const db = getDb();
  await db.delete(alteracoes);
  return true;
}

// AGENDAMENTOS CRUD
export async function getAllAgendamentos(): Promise<Agendamento[]> {
  const db = getDb();
  return db.select().from(agendamentos);
}

export async function getAgendamentoById(id: number): Promise<Agendamento | null> {
  const db = getDb();
  const [agendamento] = await db.select().from(agendamentos).where(eq(agendamentos.id, id));
  return agendamento || null;
}

export async function createAgendamento(data: InsertAgendamento): Promise<Agendamento> {
  const db = getDb();
  const [created] = await db.insert(agendamentos).values(data).returning();
  return created;
}

export async function updateAgendamento(id: number, data: Partial<InsertAgendamento>): Promise<Agendamento | null> {
  const db = getDb();
  const [updated] = await db.update(agendamentos).set(data).where(eq(agendamentos.id, id)).returning();
  return updated || null;
}

export async function deleteAgendamento(id: number): Promise<boolean> {
  const db = getDb();
  const deleted = await db.delete(agendamentos).where(eq(agendamentos.id, id)).returning();
  return !!deleted.length;
}
