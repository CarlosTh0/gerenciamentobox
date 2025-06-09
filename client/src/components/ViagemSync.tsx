import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { CargaItem } from "./CargasTable";

interface ViagemSyncProps {
  cargas: CargaItem[];
  onUpdateCargas: (updatedCargas: CargaItem[]) => void;
}

interface ViagemExterna {
  VIAGEM: string;
  PREBOX: string;
  "BOX-D": string;
  STATUS?: string;
}

export default function ViagemSync({ cargas, onUpdateCargas }: ViagemSyncProps) {
  const [apiUrl, setApiUrl] = useState(() => 
    localStorage.getItem("viagem-api-url") || ""
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem("viagem-api-key") || ""
  );
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(false);

  // Buscar dados da API externa
  const syncViagens = async () => {
    if (!apiUrl) {
      toast.error("Configure a URL da API primeiro");
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const viagensExternas: ViagemExterna[] = await response.json();
      
      // Atualizar cargas existentes com dados da API
      const cargasAtualizadas = cargas.map(carga => {
        const viagemExterna = viagensExternas.find(
          ext => ext.VIAGEM === carga.VIAGEM
        );
        
        if (viagemExterna) {
          return {
            ...carga,
            PREBOX: viagemExterna.PREBOX || carga.PREBOX,
            "BOX-D": viagemExterna["BOX-D"] || carga["BOX-D"]
          };
        }
        
        return carga;
      });

      // Verificar quantas foram atualizadas
      const atualizadas = cargasAtualizadas.filter((carga, index) => {
        const original = cargas[index];
        return carga.PREBOX !== original.PREBOX || carga["BOX-D"] !== original["BOX-D"];
      }).length;

      onUpdateCargas(cargasAtualizadas);
      setLastSync(new Date());
      
      toast.success(`Sincronização concluída: ${atualizadas} viagens atualizadas`);
      
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast.error(`Erro na sincronização: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações
  const saveConfig = () => {
    localStorage.setItem("viagem-api-url", apiUrl);
    localStorage.setItem("viagem-api-key", apiKey);
    toast.success("Configurações salvas");
  };

  // Status da integração
  const getStatusBadge = () => {
    if (!apiUrl) return <Badge variant="destructive">Não configurado</Badge>;
    if (lastSync) return <Badge variant="default">Configurado</Badge>;
    return <Badge variant="secondary">Aguardando primeiro sync</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sincronização de PREBOX/BOX-D</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Configuração da API */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">URL da API Externa</label>
            <Input 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.sistema-externo.com/viagens"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Chave da API (opcional)</label>
            <Input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sua-chave-api-aqui"
            />
          </div>
          
          <Button onClick={saveConfig} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        {/* Sincronização */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Sincronização Manual</p>
              <p className="text-xs text-muted-foreground">
                Busca PREBOX e BOX-D por VIAGEM
              </p>
            </div>
            <Button 
              onClick={syncViagens}
              disabled={loading || !apiUrl}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Sincronizando..." : "Sincronizar Agora"}
            </Button>
          </div>
          
          {lastSync && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {lastSync.toLocaleString()}
            </p>
          )}
        </div>

        {/* Estatísticas */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Estatísticas</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total de viagens:</span>
              <span className="ml-2 font-medium">{cargas.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Com PREBOX:</span>
              <span className="ml-2 font-medium">
                {cargas.filter(c => c.PREBOX && c.PREBOX.trim() !== '').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Com BOX-D:</span>
              <span className="ml-2 font-medium">
                {cargas.filter(c => c["BOX-D"] && c["BOX-D"].trim() !== '').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Completas:</span>
              <span className="ml-2 font-medium">
                {cargas.filter(c => 
                  c.PREBOX && c.PREBOX.trim() !== '' && 
                  c["BOX-D"] && c["BOX-D"].trim() !== ''
                ).length}
              </span>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Como usar:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>1. Configure a URL da API do sistema externo</li>
            <li>2. Adicione a chave de API se necessário</li>
            <li>3. Clique em "Sincronizar Agora" para buscar dados</li>
            <li>4. O sistema vai atualizar PREBOX e BOX-D por VIAGEM</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}