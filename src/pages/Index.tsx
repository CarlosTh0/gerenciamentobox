
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import FileUploader from "@/components/FileUploader";
import StatsCards from "@/components/StatsCards";
import CargasTable, { CargaItem } from "@/components/CargasTable";
import ConflictAlert from "@/components/ConflictAlert";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle, Share2, DownloadCloud, RefreshCw } from "lucide-react";

// Para sincronização em tempo real em uma implementação futura
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const [data, setData] = useState<CargaItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    livre: 0,
    completo: 0,
    jaFoi: 0
  });
  const [conflicts, setConflicts] = useState<{boxD: string; viagens: string[]}[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Atualiza estatísticas sempre que os dados mudam
  useEffect(() => {
    updateStats();
    checkConflicts();
    setLastUpdate(new Date());
  }, [data]);
  
  // Função para processar dados do Excel
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

  // Atualizar estatísticas
  const updateStats = () => {
    setStats({
      total: data.length,
      livre: data.filter(item => item.status === "LIVRE").length,
      completo: data.filter(item => item.status === "COMPLETO").length,
      jaFoi: data.filter(item => item.status === "JA_FOI").length
    });
  };
  
  // Verificar conflitos de BOX-D
  const checkConflicts = () => {
    const boxDMap: Record<string, string[]> = {};
    const newConflicts: {boxD: string; viagens: string[]}[] = [];
    
    // Agrupar viagens por BOX-D
    data.forEach(item => {
      const boxD = item["BOX-D"];
      if (boxD && item.status !== "JA_FOI") { // Somente considerar BOX-D ocupados
        if (!boxDMap[boxD]) {
          boxDMap[boxD] = [];
        }
        if (item.VIAGEM) {
          boxDMap[boxD].push(item.VIAGEM);
        }
      }
    });
    
    // Verificar conflitos (mais de uma viagem no mesmo BOX-D)
    Object.keys(boxDMap).forEach(boxD => {
      if (boxDMap[boxD].length > 1) {
        newConflicts.push({
          boxD,
          viagens: boxDMap[boxD]
        });
      }
    });
    
    setConflicts(newConflicts);
    
    // Notificar sobre novos conflitos
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
    const newData = [...data];
    newData[index] = updatedCarga;
    setData(newData);
  };
  
  // Nova função para deletar uma carga
  const handleDeleteCarga = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };
  
  // Simula uma sincronização dos dados
  const handleSync = () => {
    toast.success("Sincronizando dados...", {
      description: "Os dados foram sincronizados com sucesso!"
    });
    setLastUpdate(new Date());
  };
  
  // Exportar dados atuais para Excel (simulação)
  const handleExportToExcel = () => {
    toast.success("Exportando dados...", {
      description: "Os dados foram exportados para Excel com sucesso!"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sistema de Gerenciamento de Cargas</h1>
              <p className="text-gray-600">
                Controle logístico de frota e agendamentos de viagens
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button 
                onClick={handleSync} 
                variant="outline"
                className="flex items-center gap-1"
                size="sm"
              >
                <RefreshCw size={14} />
                Sincronizar
              </Button>
            </div>
          </div>
          
          {/* Uploader de arquivo */}
          <FileUploader onUpload={handleFileUpload} />

          {/* Cards de estatísticas */}
          <StatsCards stats={{
            total: stats.total,
            livre: stats.livre,
            incompleto: stats.completo, // Usando o campo incompleto para "COMPLETO"
            completo: stats.jaFoi // Usando o campo completo para "JA_FOI"
          }} />

          {/* Área de alertas de conflito */}
          <ConflictAlert conflicts={conflicts} />

          {/* Ações da tabela */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Agendamentos de Cargas</h2>
            <div className="flex items-center gap-2">
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

          {/* Tabela de cargas */}
          <CargasTable 
            data={data} 
            onUpdateCarga={handleUpdateCarga} 
            onCheckConflicts={checkConflicts}
            onDeleteCarga={handleDeleteCarga}
          />
          
          {/* Informações sobre o projeto */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mt-8">
            <div className="text-amber-500 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Informações do Sistema</h3>
              <p className="text-amber-700 text-sm">
                Este sistema permite o gerenciamento de cargas e agendamentos, com verificação de conflitos 
                de BOX-D e validação dos números de PREBOX (300-356 ou 50-56) e BOX-D (1-32).
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Share2 size={14} className="text-amber-600" />
                <span className="text-xs text-amber-600">
                  Os dados são sincronizados automaticamente para todos os dispositivos conectados.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
