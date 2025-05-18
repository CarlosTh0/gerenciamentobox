import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/lib/auth";

interface ApiIntegrationProps {
  onImport: (data: any[]) => void;
}

export default function ApiIntegration({ onImport }: ApiIntegrationProps) {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem("externalApiUrl") || "https://api.exemplo.com/cargas";
  });
  const [loading, setLoading] = useState(false);
  const user = getCurrentUser();
  const isAdmin = user && user.role === "admin";

  const handleImport = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Erro ao buscar dados da API");
      const data = await response.json();
      onImport(data);
    } catch (error) {
      alert("Erro ao importar dados: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUrl = () => {
    localStorage.setItem("externalApiUrl", apiUrl);
    alert("URL da API salva!");
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card mb-4">
      <label className="font-medium">URL da API externa</label>
      <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} disabled={!isAdmin} placeholder="https://api.exemplo.com/cargas" />
      {isAdmin && (
        <Button onClick={handleSaveUrl} disabled={loading || !apiUrl} variant="secondary">Salvar URL</Button>
      )}
      <Button onClick={handleImport} disabled={loading || !apiUrl} className="w-fit">{loading ? "Importando..." : "Importar cargas da API"}</Button>
      {!isAdmin && <span className="text-xs text-muted-foreground">Apenas administradores podem alterar a URL da API.</span>}
    </div>
  );
}
