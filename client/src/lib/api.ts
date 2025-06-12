// client/src/lib/api.ts
import type { CargaItem } from "@/components/CargasTable";

export async function getCargas(): Promise<CargaItem[]> {
  const res = await fetch("/api/cargas");
  if (!res.ok) throw new Error("Erro ao buscar cargas");
  return res.json();
}

export async function createCarga(carga: CargaItem): Promise<CargaItem> {
  const res = await fetch("/api/cargas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(carga),
  });
  if (!res.ok) throw new Error("Erro ao criar carga");
  return res.json();
}

export async function updateCarga(id: number | string, carga: CargaItem): Promise<CargaItem> {
  const res = await fetch(`/api/cargas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(carga),
  });
  if (!res.ok) throw new Error("Erro ao atualizar carga");
  return res.json();
}

export async function deleteCarga(id: number | string): Promise<any> {
  const res = await fetch(`/api/cargas/${id}`, {
    method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar carga");
  return res.json();
}

// Tipos para agendamento
export interface Agendamento {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  usuario_id: number;
  status: string;
}

export interface InsertAgendamento {
  titulo: string;
  descricao?: string;
  data: string;
  usuario_id: number;
  status: string;
}

export async function getAgendamentos(): Promise<Agendamento[]> {
  const res = await fetch("/api/agendamentos");
  if (!res.ok) throw new Error("Erro ao buscar agendamentos");
  return res.json();
}

export async function getAgendamento(id: number | string): Promise<Agendamento> {
  const res = await fetch(`/api/agendamentos/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar agendamento");
  return res.json();
}

export async function createAgendamento(data: InsertAgendamento): Promise<Agendamento> {
  const res = await fetch("/api/agendamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao criar agendamento");
  return res.json();
}

export async function updateAgendamento(id: number | string, data: Partial<InsertAgendamento>): Promise<Agendamento> {
  const res = await fetch(`/api/agendamentos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar agendamento");
  return res.json();
}

export async function deleteAgendamento(id: number | string): Promise<any> {
  const res = await fetch(`/api/agendamentos/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Erro ao deletar agendamento");
  return res.json();
}
