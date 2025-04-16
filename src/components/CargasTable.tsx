
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle, Truck, Box, Calendar, MapPin, Trash2, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

export interface CargaItem {
  id?: string;
  HORA: string;
  VIAGEM: string;
  FROTA: string;
  PREBOX: string;
  "BOX-D": string;
  status: "LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI";
  [key: string]: any;
}

interface CargasTableProps {
  data: CargaItem[];
  onUpdateCarga: (index: number, updatedCarga: CargaItem) => void;
  onCheckConflicts: () => void;
  onDeleteCarga?: (index: number) => void;
}

const CargasTable = ({ data, onUpdateCarga, onCheckConflicts, onDeleteCarga }: CargasTableProps) => {
  return (
    <Card className="overflow-hidden border border-gray-100 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <TableHeader icon={<Clock className="h-4 w-4" />}>HORA</TableHeader>
              <TableHeader icon={<Truck className="h-4 w-4" />}>VIAGEM</TableHeader>
              <TableHeader icon={<Truck className="h-4 w-4" />}>FROTA</TableHeader>
              <TableHeader icon={<Box className="h-4 w-4" />}>PREBOX</TableHeader>
              <TableHeader icon={<MapPin className="h-4 w-4" />}>BOX-D</TableHeader>
              <TableHeader icon={<Check className="h-4 w-4" />}>STATUS</TableHeader>
              <TableHeader>AÇÕES</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, index) => (
                <TableRow 
                  key={row.id || index} 
                  row={row} 
                  index={index} 
                  onUpdateCarga={onUpdateCarga}
                  onCheckConflicts={onCheckConflicts}
                  onDeleteCarga={onDeleteCarga}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum dado disponível. Carregue uma planilha ou adicione uma nova carga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const TableHeader = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
    <div className="flex items-center gap-2">
      {icon && <span className="text-blue-500">{icon}</span>}
      {children}
    </div>
  </th>
);

const TableRow = ({ 
  row, 
  index,
  onUpdateCarga,
  onCheckConflicts,
  onDeleteCarga
}: { 
  row: CargaItem; 
  index: number;
  onUpdateCarga: (index: number, updatedCarga: CargaItem) => void;
  onCheckConflicts: () => void;
  onDeleteCarga?: (index: number) => void;
}) => {
  const [status, setStatus] = useState<"LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI">(row.status || "LIVRE");
  const [boxD, setBoxD] = useState(row["BOX-D"] || "");
  const [hora, setHora] = useState(row.HORA || "");
  const [prebox, setPrebox] = useState(row.PREBOX || "");
  
  const validateBoxD = (value: string) => {
    const boxDNumber = parseInt(value);
    if (value === "") return true;
    return !isNaN(boxDNumber) && boxDNumber >= 1 && boxDNumber <= 32;
  };

  const validatePrebox = (value: string) => {
    if (value === "") return true;
    
    // First check if it's a number
    const preboxNumber = parseInt(value);
    if (isNaN(preboxNumber)) return false;
    
    // Then check if it's in the valid ranges
    return (
      (preboxNumber >= 300 && preboxNumber <= 356) || 
      (preboxNumber >= 50 && preboxNumber <= 56)
    );
  };
  
  useEffect(() => {
    if (status === "JA_FOI" && row["BOX-D"]) {
      toast.info(`BOX-D ${row["BOX-D"]} está disponível!`, {
        description: "A carga já foi embora e o box está livre para uso."
      });
    }
  }, [status, row]);

  const handleInputChange = (field: keyof CargaItem, value: string) => {
    const updatedCarga = { ...row, [field]: value };
    onUpdateCarga(index, updatedCarga);
  };

  const handleBoxDChange = (value: string) => {
    if (!validateBoxD(value) && value !== "") {
      toast.error("Número de BOX-D inválido", {
        description: "O BOX-D deve estar entre 1 e 32"
      });
      return;
    }
    
    setBoxD(value);
    handleInputChange("BOX-D", value);
    onCheckConflicts();
  };

  const handlePreboxChange = (value: string) => {
    if (!validatePrebox(value) && value !== "") {
      toast.error("Número de PREBOX inválido", {
        description: "O PREBOX deve estar entre 300-356 ou 50-56"
      });
      return;
    }
    
    setPrebox(value);
    handleInputChange("PREBOX", value);
  };

  const handleHoraChange = (value: string) => {
    // Format as HH:MM
    if (value) {
      // Remove non-digits
      const digitsOnly = value.replace(/[^\d]/g, '');
      
      // Format with colon
      if (digitsOnly.length <= 2) {
        setHora(digitsOnly);
      } else {
        const hours = digitsOnly.substring(0, 2);
        const minutes = digitsOnly.substring(2, 4);
        setHora(`${hours}:${minutes}`);
      }
    } else {
      setHora('');
    }
    
    handleInputChange("HORA", value);
  };

  const handleStatusChange = (newStatus: "LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI") => {
    setStatus(newStatus);
    handleInputChange("status", newStatus);
  };
  
  const handleDelete = () => {
    if (onDeleteCarga) {
      if (window.confirm("Tem certeza que deseja excluir esta carga?")) {
        onDeleteCarga(index);
        toast.success("Carga excluída com sucesso");
      }
    }
  };
  
  const getStatusStyles = (status: string) => {
    switch(status) {
      case "LIVRE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "COMPLETO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PARCIAL":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "JA_FOI":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "LIVRE":
        return <Check className="w-4 h-4 text-emerald-500" />;
      case "COMPLETO":
        return <Check className="w-4 h-4 text-blue-500" />;
      case "PARCIAL":
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      case "JA_FOI":
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };
  
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          placeholder="00:00" 
          value={hora}
          onChange={(e) => handleHoraChange(e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
          placeholder="V001" 
          value={row.VIAGEM || ""}
          onChange={(e) => handleInputChange("VIAGEM", e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
          placeholder="F123" 
          value={row.FROTA || ""}
          onChange={(e) => handleInputChange("FROTA", e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className={`w-full border ${prebox && !validatePrebox(prebox) ? 'border-red-400' : 'border-gray-200'} px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow`} 
          placeholder="300-356 ou 50-56" 
          value={prebox}
          onChange={(e) => handlePreboxChange(e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className={`w-full border ${boxD && !validateBoxD(boxD) ? 'border-red-400' : 'border-gray-200'} px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow`}
          placeholder="1-32" 
          value={boxD}
          onChange={(e) => handleBoxDChange(e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <select
            className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded text-sm border ${getStatusStyles(status)} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow`}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as "LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI")}
          >
            <option value="LIVRE">LIVRE</option>
            <option value="PARCIAL">PARCIAL</option>
            <option value="COMPLETO">COMPLETO</option>
            <option value="JA_FOI">JA FOI</option>
          </select>
          <div className="absolute inset-y-0 right-0.5 flex items-center pr-2 pointer-events-none">
            {getStatusIcon(status)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
        >
          <Trash2 size={18} />
        </Button>
      </td>
    </tr>
  );
};

export default CargasTable;
