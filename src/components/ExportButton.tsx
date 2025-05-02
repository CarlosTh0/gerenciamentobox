
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { CargaItem } from "./CargasTable";

interface ExportButtonProps {
  data: CargaItem[];
}

const ExportButton = ({ data }: ExportButtonProps) => {
  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Cargas");
    XLSX.writeFile(wb, `cargas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exportar Excel
    </Button>
  );
};

export default ExportButton;
