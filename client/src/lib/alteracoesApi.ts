// client/src/lib/alteracoesApi.ts

export async function getAlteracoes() {
  const res = await fetch("/api/alteracoes");
  if (!res.ok) throw new Error("Erro ao buscar alterações");
  return res.json();
}

export async function clearAlteracoes() {
  const res = await fetch("/api/alteracoes", {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Erro ao limpar alterações");
  return res.json();
}
