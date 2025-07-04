import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import FileUploader from "@/components/FileUploader";
import StatsCards from "@/components/StatsCards";
import CargasTable, { CargaItem } from "@/components/CargasTable";
import ConflictAlert from "@/components/ConflictAlert";
import WelcomeMessage from "@/components/WelcomeMessage";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, DownloadCloud, RefreshCw, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as XLSX from 'xlsx';
import { getCurrentUser } from "@/lib/auth";
import FrotasFila from "@/components/FrotasFila";
import ViagemSync from "@/components/ViagemSync";
import { getCargas, createCarga, updateCarga, deleteCarga } from "@/lib/api";

const DEFAULT_SYNC_INTERVAL = 600000; // 10 minutos

const Index = () => {
  const [data, setData] = useState<CargaItem[]>([]);
  const [filteredData, setFilteredData] = useState<CargaItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    livre: 0,
    incompleto: 0, // Adicionado para compatibilidade
    completo: 0,
    parcial: 0,
    jaFoi: 0
  });
  const [conflicts, setConflicts] = useState<{boxD: string; viagens: string[]}[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [sortField, setSortField] = useState<string>("HORA");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [syncInterval, setSyncInterval] = useState(DEFAULT_SYNC_INTERVAL);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeUntilNextSyncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(syncInterval);

  const user = getCurrentUser();

  // Ref para rolar até a frota na tabela
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Busca cargas do backend na montagem
    getCargas().then(setData).catch(() => toast.error("Erro ao carregar cargas do servidor"));
  }, []);

  useEffect(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
    }

    if (timeUntilNextSyncRef.current) {
      clearInterval(timeUntilNextSyncRef.current);
    }

    syncTimerRef.current = setInterval(() => {
      syncData();
    }, syncInterval);

    setTimeRemaining(syncInterval);
    timeUntilNextSyncRef.current = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
      if (timeUntilNextSyncRef.current) clearInterval(timeUntilNextSyncRef.current);
    };
  }, [syncInterval]);

  // Remove localStorage, salva apenas no backend
  useEffect(() => {
    updateStats();
    checkConflicts();
    applyFilters();
  }, [data]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, data]);

  // Lista padrão de BOX-D (1 a 32)
  const boxDPadrao = Array.from({ length: 32 }, (_, i) => (i + 1).toString());
  
  // BOX-D ocupados: só considera cargas cujo status NÃO é 'JA_FOI', status não vazio e BOX-D preenchido
  const boxDOcupados = data
    .filter(item => {
      const status = String(item["status"] || "").toUpperCase();
      const boxd = String(item["BOX-D"] || "").trim();
      return status !== "JA_FOI" && status !== "" && boxd !== "";
    })
    .map(item => String(item["BOX-D"]).trim());
  
  // BOX-D extras (além dos 32 padrão) que foram usados
  const boxDExtras = data
    .map(item => String(item["BOX-D"] || "").trim())
    .filter(boxd => boxd !== "" && !boxDPadrao.includes(boxd))
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicados
  
  // Lista completa de BOX-D (padrão + extras)
  const todosBoxD = [...boxDPadrao, ...boxDExtras];
  
  // BOX-D disponíveis (não ocupados)
  const boxDDisponiveis = todosBoxD.filter(b => !boxDOcupados.includes(b));
  

  const applyFilters = () => {
    let result = [...data];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => {
        // Busca em todos os campos do objeto
        return Object.values(item).some(value =>
          String(value || "").toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter !== "TODOS") {
      result = result.filter(item => item.status === statusFilter);
    }

    result.sort((a, b) => {
      let valueA = a[sortField as keyof CargaItem];
      let valueB = b[sortField as keyof CargaItem];

      const stringA = String(valueA || "");
      const stringB = String(valueB || "");

      if (sortField === "HORA") {
        const formattedA = stringA.replace ? stringA.replace(":", "") : stringA || "";
        const formattedB = stringB.replace ? stringB.replace(":", "") : stringB || "";

        if (formattedA < formattedB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (formattedA > formattedB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      } else {
        if (stringA < stringB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (stringA > stringB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      }
    });

    setFilteredData(result);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFileUpload = async (excelData: any[]) => {
    // Mapeia as cargas existentes por VIAGEM
    const dataByViagem = new Map(data.map(item => [item.VIAGEM, item]));
    let atualizadas = 0;
    let adicionadas = 0;
    const processedData = excelData.map(row => {
      const viagem = row.VIAGEM || "";
      // Corrigido: garantir que o status seja um dos valores válidos
      let status: "LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI" = "LIVRE";
      const rawStatus = String(row.status || "").toUpperCase();
      if (["LIVRE", "COMPLETO", "PARCIAL", "JA_FOI"].includes(rawStatus)) {
        status = rawStatus as "LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI";
      }
      
      const carga: CargaItem = {
        id: uuidv4(),
        HORA: row.HORA || "",
        VIAGEM: viagem,
        FROTA: row.FROTA || "",
        PREBOX: row.PREBOX || "",
        "BOX-D": row["BOX-D"] || "",
        status: status
      };
      if (dataByViagem.has(viagem)) {
        atualizadas++;
      } else {
        adicionadas++;
      }
      return carga;
    });
    // Substitui cargas existentes pela VIAGEM, adiciona novas
    const novasViagens = new Set(processedData.map(c => c.VIAGEM));
    const restantes = data.filter(item => !novasViagens.has(item.VIAGEM));
    // Persiste cada carga no backend
    for (const carga of processedData) {
      const existente = dataByViagem.get(carga.VIAGEM);
      if (existente) {
        await updateCarga(existente.id!, carga);
      } else {
        await createCarga(carga);
      }
    }
    // Atualiza lista
    getCargas().then(setData);
    toast.success(`Importação concluída! ${adicionadas} novas, ${atualizadas} atualizadas.`);
  };

  const updateStats = () => {
    setStats({
      total: data.length,
      livre: data.filter(item => item.status === "LIVRE").length,
      incompleto: 0, // Adicionado para compatibilidade
      completo: data.filter(item => item.status === "COMPLETO").length,
      parcial: data.filter(item => item.status === "PARCIAL").length,
      jaFoi: data.filter(item => item.status === "JA_FOI").length
    });
  };

  const checkConflicts = () => {
    const boxDMap: Record<string, string[]> = {};
    const newConflicts: {boxD: string; viagens: string[]}[] = [];

    data.forEach(item => {
      const boxD = item["BOX-D"];
      if (boxD && (item.status === "LIVRE" || item.status === "COMPLETO" || item.status === "PARCIAL")) {
        if (!boxDMap[boxD]) {
          boxDMap[boxD] = [];
        }
        if (item.VIAGEM) {
          boxDMap[boxD].push(item.VIAGEM);
        }
      }
    });

    Object.keys(boxDMap).forEach(boxD => {
      if (boxDMap[boxD].length > 1) {
        newConflicts.push({
          boxD,
          viagens: boxDMap[boxD]
        });
      }
    });

    setConflicts(newConflicts);

    if (newConflicts.length > 0 && newConflicts.length !== conflicts.length) {
      toast.warning(`${newConflicts.length} conflitos detectados!`, {
        description: "Verifique os detalhes na área de alertas."
      });
    }
  };

  const saveAlteracao = (tipo: 'criação' | 'atualização' | 'exclusão', dados: any) => {
    const alteracao = {
      id: uuidv4(),
      timestamp: new Date(),
      tipo,
      dados
    };
    
    const alteracoes = JSON.parse(localStorage.getItem('alteracoes') || '[]');
    alteracoes.push(alteracao);
    localStorage.setItem('alteracoes', JSON.stringify(alteracoes));
  };

  const handleAddCarga = async () => {
    const currentTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const newCarga: CargaItem = {
      id: uuidv4(),
      HORA: currentTime,
      VIAGEM: "",
      FROTA: "",
      PREBOX: "",
      "BOX-D": "",
      status: "LIVRE"
    };
    await createCarga(newCarga);
    getCargas().then(setData);
    toast.success("Nova carga adicionada!");
    applyFilters();
  };

  const handleUpdateCarga = async (index: number, updatedCarga: CargaItem) => {
    const dataIndex = data.findIndex(item => item.id === filteredData[index].id);
    if (dataIndex !== -1) {
      await updateCarga(data[dataIndex].id!, updatedCarga);
      getCargas().then(setData);
    }
  };

  const handleDeleteCarga = async (index: number) => {
    const dataIndex = data.findIndex(item => item.id === filteredData[index].id);
    if (dataIndex !== -1) {
      await deleteCarga(data[dataIndex].id!);
      getCargas().then(setData);
    }
  };

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const cargas = await getCargas();
      setData(cargas);
      toast.success("Sincronizado com sucesso", {
        description: `Dados atualizados em ${new Date().toLocaleTimeString()}`
      });
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      toast.error("Erro ao sincronizar dados");
    } finally {
      setIsSyncing(false);
      setLastUpdate(new Date());
      setTimeRemaining(syncInterval);
    }
  };

  const handleSync = () => {
    syncData();
  };

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleChangeSyncInterval = (newInterval: number) => {
    setSyncInterval(newInterval);
    localStorage.setItem('sync-interval', String(newInterval));
    toast.success(`Intervalo de sincronização alterado para ${newInterval / 60000} minutos`);
  };

  const handleExportToExcel = () => {
    try {
      // Preparar os dados para exportação
      const dataToExport = data.map(item => ({
        HORA: item.HORA,
        VIAGEM: item.VIAGEM,
        FROTA: item.FROTA,
        PREBOX: item.PREBOX,
        "BOX-D": item["BOX-D"],
        STATUS: item.status
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, "Cargas");

      // Gerar arquivo e fazer download
      const fileName = `cargas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success("Exportação concluída", {
        description: `Dados exportados para ${fileName}`
      });
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar dados para Excel");
    }
  };

  // Função para importar dados da API externa e mesclar com os dados atuais
  const handleApiImport = (apiData: any[]) => {
    // Adapta os dados recebidos da API para o formato da tabela
    const newCargas = apiData.map((row: any) => ({
      id: uuidv4(),
      HORA: row.HORA || row.hora || "",
      VIAGEM: row.VIAGEM || row.viagem || "",
      FROTA: row.FROTA || row.frota || "",
      PREBOX: row.PREBOX || row.prebox || "",
      "BOX-D": row["BOX-D"] || row.boxD || row.box_d || "",
      status: row.status || row.STATUS || "LIVRE"
    }));
    // Mescla sem duplicar viagens já existentes
    const viagensExistentes = new Set(data.map(item => item.VIAGEM));
    const cargasParaAdicionar = newCargas.filter(c => !viagensExistentes.has(c.VIAGEM));
    if (cargasParaAdicionar.length === 0) {
      toast.info("Nenhuma nova carga encontrada na API.");
      return;
    }
    setData([...data, ...cargasParaAdicionar]);
    toast.success(`${cargasParaAdicionar.length} cargas importadas da API!`);
  };

  // Função para rolar até a frota na tabela
  const scrollToFrota = (frota: string) => {
    if (!tableRef.current) return;
    // Remove destaque anterior
    tableRef.current.querySelectorAll("tr[data-frota]").forEach(tr => {
      tr.classList.remove("ring-2", "ring-primary", "bg-yellow-100");
    });
    // Seleciona e destaca
    const row = tableRef.current.querySelector(
      `tr[data-frota='${frota}']`
    ) as HTMLTableRowElement | null;
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      row.classList.add("ring-2", "ring-primary", "bg-yellow-100");
      setTimeout(() => {
        row.classList.remove("ring-2", "ring-primary", "bg-yellow-100");
      }, 2000);
    }
  };

  return (
    <div className="h-full bg-background">
      <div className="container mx-auto max-w-[1400px] py-3 sm:py-6 px-2 sm:px-4">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <WelcomeMessage userName={user?.name || "Operador"} />
          </div>

          <FileUploader onUpload={handleFileUpload} />

          {user?.role === 'admin' && (
            <ViagemSync cargas={data} onUpdateCargas={(updatedCargas) => {
              setData(updatedCargas);
              // Salva alterações para cada viagem atualizada
              updatedCargas.forEach((carga, index) => {
                if (data[index] && (
                  carga.PREBOX !== data[index].PREBOX || 
                  carga["BOX-D"] !== data[index]["BOX-D"]
                )) {
                  saveAlteracao('atualização', carga);
                }
              });
            }} />
          )}

          <StatsCards stats={stats} boxDDisponiveis={boxDDisponiveis} boxDOcupados={boxDOcupados} />

          <ConflictAlert conflicts={conflicts} />

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Lista lateral de frotas na fila */}
            <div className="lg:w-72 w-full mb-3 lg:mb-0">
              <FrotasFila cargas={data} onSelectFrota={scrollToFrota} />
            </div>
            <div className="flex-1">
              <div className="space-y-3 sm:space-y-4 bg-card rounded-xl p-3 sm:p-6 shadow-lg">
                {/* ...filtros e ações... */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold">Lista de Cargas</h2>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {filteredData.length} de {data.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Button 
                      onClick={handleExportToExcel}
                      variant="outline"
                      className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm"
                      size="sm"
                    >
                      <DownloadCloud className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Exportar Excel</span>
                      <span className="xs:hidden">Excel</span>
                    </Button>
                    <Button 
                      onClick={handleAddCarga}
                      className="flex items-center gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600 flex-1 sm:flex-none text-xs sm:text-sm"
                      size="sm"
                    >
                      <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden xs:inline">Adicionar Carga</span>
                      <span className="xs:hidden">Adicionar</span>
                    </Button>

                  </div>
                </div>
                {/* ...filtros de busca... */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar viagem, frota, box..."
                        className="pl-8 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {/* Tabela de cargas com ref para rolagem */}
                <div ref={tableRef} className="overflow-x-auto rounded-lg border bg-background">
                  <CargasTable 
                    data={filteredData} 
                    onUpdateCarga={handleUpdateCarga} 
                    onCheckConflicts={checkConflicts}
                    onDeleteCarga={handleDeleteCarga}
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ...alertas e informações do sistema... */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 flex items-start gap-3 mt-6">
            <div className="text-amber-500 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Informações do Sistema</h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Este sistema permite o gerenciamento de cargas e agendamentos, com verificação de conflitos 
                de BOX-D e validação dos números de PREBOX (300-356 ou 50-56) e BOX-D (1-32).
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-amber-600 dark:text-amber-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                  <span>Modo Offline Disponível</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <span>Sincronização: {syncInterval / 60000}min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
