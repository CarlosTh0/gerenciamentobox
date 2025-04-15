
import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import StatsCards from "@/components/StatsCards";
import CargasTable from "@/components/CargasTable";
import { toast } from "@/components/ui/sonner";

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* Uploader de arquivo */}
        <div className="mb-6">
          <FileUploader onUpload={handleFileUpload} />
        </div>

        {/* Cards de estatísticas */}
        <StatsCards stats={stats} />

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-800 my-6 text-center">Agendamentos de Cargas</h2>

        {/* Área de mensagens */}
        <div className="bg-yellow-100 border border-yellow-200 p-4 rounded-md mb-6">
          {/* Aqui iria lógica de mensagens dinâmicas */}
        </div>

        {/* Tabela de cargas */}
        <CargasTable data={data} />

        {/* Botão adicionar */}
        <div className="flex justify-center mt-6">
          <button 
            onClick={handleAddCarga}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Adicionar Carga
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
