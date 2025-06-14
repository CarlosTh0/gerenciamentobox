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
    localStorage.getItem("viagem-api-url") || "https://9c4eeb09-fb32-4ebf-9cda-12e0bf81c018-00-s5hsqe65wxdo.riker.replit.dev/api/export/trips"
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem("viagem-api-key") || ""
  );
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncMode, setSyncMode] = useState<'all' | 'compare'>('all');
  const [testResults, setTestResults] = useState<string | null>(null);

  // Buscar dados da API externa
  const syncViagens = async () => {
    if (!apiUrl) {
      toast.error("Configure a URL da API primeiro");
      return;
    }

    setLoading(true);
    try {
      let viagensExternas: any[] = [];

      if (syncMode === 'all') {
        // Buscar todas as viagens
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        viagensExternas = await response.json();
      } else {
        // Modo comparação - enviar lista de viagens para comparar
        const viagensParaComparar = cargas.map(c => c.VIAGEM).filter(v => v && v.trim() !== '');
        
        const response = await fetch('https://9c4eeb09-fb32-4ebf-9cda-12e0bf81c018-00-s5hsqe65wxdo.riker.replit.dev/api/export/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ viagens: viagensParaComparar })
        });
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        viagensExternas = await response.json();
      }

      // Atualizar cargas existentes com dados da API
      const cargasAtualizadas = cargas.map(carga => {
        // Buscar dados da viagem na resposta da API
        const viagemExterna = viagensExternas.find(
          ext => ext.viagem === carga.VIAGEM || ext.VIAGEM === carga.VIAGEM
        );
        
        if (viagemExterna) {
          return {
            ...carga,
            PREBOX: viagemExterna.prebox || viagemExterna.PREBOX || carga.PREBOX,
            "BOX-D": viagemExterna.boxd || viagemExterna["BOX-D"] || carga["BOX-D"]
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
      
      toast.success(`Sincronização concluída: ${atualizadas} viagens atualizadas de ${viagensExternas.length} encontradas`);
      
    } catch (error) {
      console.error("Erro na sincronização:", error);
      toast.error(`Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
            <label className="text-sm font-medium">Modo de Sincronização</label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={syncMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSyncMode('all');
                  setApiUrl('https://9c4eeb09-fb32-4ebf-9cda-12e0bf81c018-00-s5hsqe65wxdo.riker.replit.dev/api/export/trips');
                }}
              >
                Todas as Viagens
              </Button>
              <Button
                variant={syncMode === 'compare' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSyncMode('compare');
                  setApiUrl('https://9c4eeb09-fb32-4ebf-9cda-12e0bf81c018-00-s5hsqe65wxdo.riker.replit.dev/api/export/compare');
                }}
              >
                Comparar Viagens
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">URL da API</label>
            <Input 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="URL da API"
              className="text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {syncMode === 'all' 
                ? 'Busca todas as viagens disponíveis'
                : 'Compara apenas viagens existentes no sistema'
              }
            </p>
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
                {cargas.filter(c => typeof c.PREBOX === 'string' && c.PREBOX.trim() !== '').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Com BOX-D:</span>
              <span className="ml-2 font-medium">
                {cargas.filter(c => typeof c["BOX-D"] === 'string' && c["BOX-D"].trim() !== '').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Completas:</span>
              <span className="ml-2 font-medium">
                {cargas.filter(c => 
                  typeof c.PREBOX === 'string' && c.PREBOX.trim() !== '' && 
                  typeof c["BOX-D"] === 'string' && c["BOX-D"].trim() !== ''
                ).length}
              </span>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">APIs Disponíveis:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li><strong>Todas as Viagens:</strong> Busca todos os dados disponíveis</li>
            <li><strong>Comparar Viagens:</strong> Envia suas viagens e recebe PREBOX vinculados</li>
            <li><strong>Consulta específica:</strong> /api/export/prebox/ID para PRE-BOX específico</li>
            <li><strong>Dados básicos:</strong> /api/trips e /api/preboxes disponíveis</li>
          </ul>
          <p className="text-xs text-blue-700 mt-2">
            Sistema atualiza automaticamente PREBOX e BOX-D por VIAGEM
          </p>
        </div>
      </CardContent>
    </Card>
  );
}