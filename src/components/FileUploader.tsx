
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Upload } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onUpload: (data: any[]) => void;
}

const FileUploader = ({ onUpload }: FileUploaderProps) => {
  const [fileName, setFileName] = useState("Nenhum arquivo escolhido");
  const [isLoading, setIsLoading] = useState(false);

  const processExcelFile = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        
        onUpload(parsedData);
        toast.success("Planilha carregada com sucesso!");
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        toast.error("Erro ao processar o arquivo. Verifique o formato.");
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Erro ao ler o arquivo");
      setIsLoading(false);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      processExcelFile(file);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative group">
            <label className="relative cursor-pointer flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md px-4 py-2 border border-gray-200">
              <FileUp size={18} />
              <span className="font-medium">Escolher arquivo</span>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                disabled={isLoading}
              />
            </label>
          </div>
          <span className="ml-3 text-gray-600 text-sm truncate max-w-xs">{fileName}</span>
        </div>
        
        <Button
          onClick={() => toast.info("Utilize o botão 'Escolher arquivo' para carregar uma planilha")}
          className="w-full sm:w-auto flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
          disabled={isLoading}
        >
          <Upload size={16} />
          {isLoading ? "Processando..." : "Carregar Excel"}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
