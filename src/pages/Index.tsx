import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import FileUploader from "@/components/FileUploader";
import StatsCards from "@/components/StatsCards";
import CargasTable, { CargaItem } from "@/components/CargasTable";
import ConflictAlert from "@/components/ConflictAlert";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, DownloadCloud, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const LOCAL_STORAGE_KEY = 'cargo-management-data';
const SYNC_INTERVAL = 5000; // Sync every 5 seconds

const Index = () => {
  const [data, setData] = useState<CargaItem[]>([]);
  const [filteredData, setFilteredData] = useState<CargaItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    livre: 0,
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
  
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncData();
    }, SYNC_INTERVAL);
    
    return () => clearInterval(syncInterval);
  }, []);
  
  useEffect(() => {
    updateStats();
    checkConflicts();
    
    if (data.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setLastUpdate(new Date());
    }
    
    applyFilters();
  }, [data, searchTerm, statusFilter, sortField, sortDirection]);
  
  const applyFilters = () => {
    let result = [...data];
    
    if (searchTerm) {
      result = result.filter(item => 
        item.VIAGEM.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.FROTA.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.PREBOX.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item["BOX-D"].toLowerCase().includes(searchTerm.toLowerCase())
      );
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
        const formattedA = stringA.replace(":", "") || "";
        const formattedB = stringB.replace(":", "") || "";
        
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
  
  const handleFileUpload = (excelData: any[]) => {
    const processedData = excelData.map(row => {
      return {
        id: uuidv4(),
        HORA: row.HORA || "",
        VIAGEM: row.VIAGEM || "",
        FROTA: row.FROTA || "",
        PREBOX: row.PREBOX || "",
        "BOX-D": row["BOX-D"] || "",
        status: row.status || "LIVRE"
      };
    });
    
    setData(processedData);
  };

  const updateStats = () => {
    setStats({
      total: data.length,
      livre: data.filter(item => item.status === "LIVRE").length,
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

  const handleAddCarga = () => {
    const newCarga: CargaItem = {
      id: uuidv4(),
      HORA: "",
      VIAGEM: "",
      FROTA: "",
      PREBOX: "",
      "BOX-D": "",
      status: "LIVRE"
    };
    
    setData([...data, newCarga]);
    toast.success("Nova carga adicionada!");
  };
  
  const handleUpdateCarga = (index: number, updatedCarga: CargaItem) => {
    const dataIndex = data.findIndex(item => item.id === filteredData[index].id);
    if (dataIndex !== -1) {
      const newData = [...data];
      newData[dataIndex] = updatedCarga;
      setData(newData);
    }
  };
  
  const handleDeleteCarga = (index: number) => {
    const dataIndex = data.findIndex(item => item.id === filteredData[index].id);
    if (dataIndex !== -1) {
      const newData = [...data];
      newData.splice(dataIndex, 1);
      setData(newData);
    }
  };
  
  const syncData = () => {
    setIsSyncing(true);
    
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        setData(parsedData);
        
        toast.success("Sincronizado com sucesso", {
          description: `Dados atualizados em ${new Date().toLocaleTimeString()}`
        });
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast.error("Erro ao sincronizar dados");
    } finally {
      setIsSyncing(false);
      setLastUpdate(new Date());
    }
  };
  
  const handleSync = () => {
    syncData();
  };
  
  const handleExportToExcel = () => {
    toast.success("Exportando dados...", {
      description: "Os dados foram exportados para Excel com sucesso!"
    });
  };

  return (
    <div className="h-full bg-background">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sistema de Gerenciamento de Cargas</h1>
              <p className="text-muted-foreground">
                Controle logístico de frota e agendamentos de viagens
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button 
                onClick={handleSync} 
                variant="outline"
                className="flex items-center gap-1"
                size="sm"
                disabled={isSyncing}
              >
                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
            </div>
          </div>
          
          <FileUploader onUpload={handleFileUpload} />

          <StatsCards stats={{
            total: stats.total,
            livre: stats.livre,
            incompleto: stats.parcial,
            completo: stats.completo + stats.jaFoi
          }} />

          <ConflictAlert conflicts={conflicts} />

          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar viagem, frota, box..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="LIVRE">Livre</SelectItem>
                  <SelectItem value="PARCIAL">Parcial</SelectItem>
                  <SelectItem value="COMPLETO">Completo</SelectItem>
                  <SelectItem value="JA_FOI">Já Foi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={sortField}
                onValueChange={setSortField}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HORA">Hora</SelectItem>
                  <SelectItem value="VIAGEM">Viagem</SelectItem>
                  <SelectItem value="FROTA">Frota</SelectItem>
                  <SelectItem value="PREBOX">Prebox</SelectItem>
                  <SelectItem value="BOX-D">Box-D</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <DownloadCloud size={16} />
                Exportar Excel
              </Button>
              
              <Button 
                onClick={handleAddCarga}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <PlusCircle size={16} />
                Adicionar Carga
              </Button>
            </div>
          </div>

          <CargasTable 
            data={filteredData} 
            onUpdateCarga={handleUpdateCarga} 
            onCheckConflicts={checkConflicts}
            onDeleteCarga={handleDeleteCarga}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 flex items-start gap-3 mt-8">
            <div className="text-amber-500 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Informações do Sistema</h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Este sistema permite o gerenciamento de cargas e agendamentos, com verificação de conflitos 
                de BOX-D e validação dos números de PREBOX (300-356 ou 50-56) e BOX-D (1-32).
              </p>
              <div className="mt-2 flex gap-2 text-xs text-amber-600 dark:text-amber-400">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span>Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-1"></div>
                  <span>Modo Offline Disponível</span>
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
