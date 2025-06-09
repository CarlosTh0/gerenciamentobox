import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface DatabaseIntegrationProps {
  onImport: (data: any[]) => void;
}

export default function DatabaseIntegration({ onImport }: DatabaseIntegrationProps) {
  const [connectionString, setConnectionString] = useState("");
  const [query, setQuery] = useState("SELECT * FROM cargas WHERE status = 'ATIVO'");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Faria conexão com banco externo
      const response = await fetch('/api/external-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, query })
      });
      
      if (!response.ok) throw new Error("Erro na conexão");
      
      const data = await response.json();
      onImport(data);
      toast.success(`${data.length} registros importados do banco externo`);
    } catch (error) {
      toast.error("Erro ao conectar com banco externo: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexão com Banco Externo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">String de Conexão</label>
          <Input 
            type="password"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="Server=localhost;Database=sistema;User=user;Password=***"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Query SQL</label>
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM tabela"
          />
        </div>
        <Button 
          onClick={handleConnect} 
          disabled={loading || !connectionString}
          className="w-full"
        >
          {loading ? "Conectando..." : "Importar do Banco"}
        </Button>
      </CardContent>
    </Card>
  );
}