
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import StatsCards from "@/components/StatsCards";
import CargasTable from "@/components/CargasTable";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertTriangle } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    livre: 0,
    incompleto: 0,
    completo: 0
  });

  const handleFileUpload = () => {
    // Simulação de upload bem-sucedido
    toast.success("Arquivo carregado com sucesso!");
    
    // Dados simulados
    const mockData = [
      { HORA: "08:00", VIAGEM: "V001", FROTA: "F123", PREBOX: "PB001", "BOX-D": "B1" },
      { HORA: "--", VIAGEM: "", FROTA: "", PREBOX: "", "BOX-D": "" }
    ];
    
    setData(mockData);
    
    // Atualizar estatísticas
    setStats({
      total: 10,
      livre: 5,
      incompleto: 3,
      completo: 2
    });
  };

  const handleAddCarga = () => {
    const newRow = { HORA: "--", VIAGEM: "", FROTA: "", PREBOX: "", "BOX-D": "" };
    setData([...data, newRow]);
    toast.success("Nova linha adicionada!");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Cabeçalho */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard de Agendamentos</h1>
            <p className="text-gray-600">Gerencie todas as cargas e programações em um único lugar</p>
          </div>
          
          {/* Uploader de arquivo */}
          <FileUploader onUpload={handleFileUpload} />

          {/* Cards de estatísticas */}
          <StatsCards stats={stats} />

          {/* Área de mensagens */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-amber-500 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-medium text-amber-800">Atenção</h3>
              <p className="text-amber-700 text-sm">
                Verifique se todas as informações estão corretas antes de finalizar os agendamentos.
              </p>
            </div>
          </div>

          {/* Título */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Agendamentos de Cargas</h2>
            <Button 
              onClick={handleAddCarga}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <PlusCircle size={16} />
              Adicionar Carga
            </Button>
          </div>

          {/* Tabela de cargas */}
          <CargasTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default Index;
