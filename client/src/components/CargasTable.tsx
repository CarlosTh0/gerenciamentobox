import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle, Truck, Box, MapPin, Trash2, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react"; // Assuming this import is needed
import { Search } from "lucide-react"; // Assuming this import is needed
import { FileSpreadsheet } from "lucide-react"; // Assuming this import is needed


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
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

interface TableHeaderProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const TableHeader = ({ children, icon }: TableHeaderProps) => {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        {children}
      </div>
    </th>
  );
};

const CargasTable = ({ 
  data, 
  onUpdateCarga, 
  onCheckConflicts, 
  onDeleteCarga,
  onSort,
  sortField,
  sortDirection
}: CargasTableProps) => {
  useEffect(() => {
    const checkOccupationTime = () => {
      data.forEach(item => {
        if (item["BOX-D"] && item.status !== "LIVRE") {
          const occupationTime = new Date().getTime() - new Date(item.HORA).getTime();
          const hoursOccupied = occupationTime / (1000 * 60 * 60);

          if (hoursOccupied > 4) {
            toast.warning(`Box ${item["BOX-D"]} ocupado por mais de 4 horas`, {
              description: `Viagem: ${item.VIAGEM}`
            });
          }
        }
      });
    };

    const interval = setInterval(checkOccupationTime, 1800000);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <Card className="overflow-hidden border border-border rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/50 border-b border-border">
                <TableHeader icon={<Clock className="h-4 w-4" />}>HORA</TableHeader>
                <TableHeader icon={<Truck className="h-4 w-4" />}>VIAGEM</TableHeader>
                <TableHeader icon={<Truck className="h-4 w-4" />}>FROTA</TableHeader>
                <TableHeader icon={<Box className="h-4 w-4" />}>PREBOX</TableHeader>
                <TableHeader icon={<MapPin className="h-4 w-4" />}>BOX-D</TableHeader>
                <TableHeader icon={<Check className="h-4 w-4" />}>STATUS</TableHeader>
                <TableHeader>AÇÕES</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length > 0 ? (
                data.map((row, index) => (
                  <TableRow 
                    key={row.id || index} 
                    row={row} 
                    index={index} 
                    onUpdateCarga={onUpdateCarga}
                    onCheckConflicts={onCheckConflicts}
                    onDeleteCarga={onDeleteCarga}
                    dataFrota={row.FROTA || undefined}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum dado disponível. Carregue uma planilha ou adicione uma nova carga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

const TableRow = ({ 
  row, 
  index,
  onUpdateCarga,
  onCheckConflicts,
  onDeleteCarga,
  dataFrota
}: { 
  row: CargaItem; 
  index: number;
  onUpdateCarga: (index: number, updatedCarga: CargaItem) => void;
  onCheckConflicts: () => void;
  onDeleteCarga?: (index: number) => void;
  dataFrota?: string;
}) => {
  const [status, setStatus] = useState<"LIVRE" | "COMPLETO" | "PARCIAL" | "JA_FOI">(row.status || "LIVRE");
  const [boxD, setBoxD] = useState(row["BOX-D"] || "");
  const [hora, setHora] = useState(row.HORA || "");
  const [prebox, setPrebox] = useState(row.PREBOX || "");

  const convertDecimalToTime = (decimalValue: any): string => {
    if (decimalValue === undefined || decimalValue === null || decimalValue === "") {
      return "";
    }

    try {
      const strValue = String(decimalValue);

      if (strValue.includes(':')) {
        return strValue;
      }

      const decimal = parseFloat(strValue);

      if (isNaN(decimal)) {
        return strValue;
      }

      const totalMinutes = Math.round(decimal * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Error converting decimal to time:", error, decimalValue);
      return String(decimalValue);
    }
  };

  const validateBoxD = (value: string) => {
    if (value === "") return true;
    // Aceita qualquer valor alfanumérico válido (números, letras + números como G63, etc.)
    if (typeof value !== 'string') return false;
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) return false;
    // Se for só número, deve ser maior que 0
    const boxDNumber = parseInt(trimmedValue);
    if (!isNaN(boxDNumber)) {
      return boxDNumber > 0;
    }
    // Se contém letras e números, aceita qualquer combinação válida
    return /^[A-Za-z0-9]+$/.test(trimmedValue);
  };

  const validatePrebox = (value: string) => {
    if (value === "") return true;

    const preboxNumber = parseInt(value);
    if (isNaN(preboxNumber)) return false;

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

  useEffect(() => {
    setStatus(row.status);
    setBoxD(row["BOX-D"]);

    try {
      const formattedHora = convertDecimalToTime(row.HORA);
      setHora(formattedHora);
    } catch (error) {
      console.error("Erro ao converter hora:", error, row.HORA);
      setHora(row.HORA || "");
    }

    setPrebox(row.PREBOX);
  }, [row]);

  const handleInputChange = (field: keyof CargaItem, value: string) => {
    const updatedCarga = { ...row, [field]: value };
    onUpdateCarga(index, updatedCarga);
  };

  const handleBoxDChange = (value: string) => {
    if (!validateBoxD(value) && value !== "") {
      toast.error("Número de BOX-D inválido", {
        description: "O BOX-D deve ser um número válido maior que 0"
      });
      return;
    }

    setBoxD(value);

    if (value && value.trim() !== "") {
      setStatus("PARCIAL");
      handleInputChange("status", "PARCIAL");
    }

    handleInputChange("BOX-D", value);
    onCheckConflicts();
  };

  const handlePreboxChange = (value: string) => {
    setPrebox(value);
    handleInputChange("PREBOX", value);

    if (!validatePrebox(value) && value !== "") {
      toast.warning("Número de PREBOX recomendado: 300-356 ou 50-56", {
        description: "Você pode continuar, mas o valor está fora do padrão."
      });
    }
  };

  const handleHoraChange = (value: string) => {
    if (value && String(value).includes('.') && !String(value).includes(':')) {
      try {
        const convertedTime = convertDecimalToTime(value);
        setHora(convertedTime);
        handleInputChange("HORA", convertedTime);
      } catch (error) {
        console.error("Erro ao converter hora:", error);
        setHora(value);
        handleInputChange("HORA", value);
      }
      return;
    }

    if (value) {
      const digitsOnly = value.replace(/[^\d]/g, '');

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

    handleInputChange("HORA", hora);
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
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
      case "COMPLETO":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "PARCIAL":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
      case "JA_FOI":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700";
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
    <tr data-frota={dataFrota}>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-input px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-shadow bg-background"
          placeholder="00:00" 
          value={hora}
          onChange={(e) => handleHoraChange(e.target.value)}
          onBlur={() => handleInputChange("HORA", hora)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-input px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-shadow bg-background" 
          placeholder="V001" 
          value={row.VIAGEM || ""}
          onChange={(e) => handleInputChange("VIAGEM", e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-input px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-shadow bg-background" 
          placeholder="F123" 
          value={row.FROTA || ""}
          onChange={(e) => handleInputChange("FROTA", e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-input px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-shadow bg-background" 
          placeholder="300-356 ou 50-56" 
          value={prebox}
          onChange={(e) => handlePreboxChange(e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className={`w-full border ${boxD && !validateBoxD(boxD) ? 'border-destructive' : 'border-input'} px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-shadow bg-background`}
          placeholder="BOX-D" 
          value={boxD}
          onChange={(e) => handleBoxDChange(e.target.value)}
        />
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <select
            className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded text-sm border ${getStatusStyles(status)} focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-shadow`}
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
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 size={18} />
        </Button>
      </td>
    </tr>
  );
};

export default CargasTable;