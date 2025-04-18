
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, FolderOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onUpload: (data: any[]) => void;
}

const FileUploader = ({ onUpload }: FileUploaderProps) => {
  const [fileName, setFileName] = useState("Nenhum arquivo escolhido");
  const [isLoading, setIsLoading] = useState(false);
  const [isAutomaticLoading, setIsAutomaticLoading] = useState(false);

  // Função para converter valor decimal para formato HH:MM
  const convertDecimalToTime = (decimalValue: any): string => {
    try {
      // Handle null, undefined or empty value
      if (decimalValue === undefined || decimalValue === null || decimalValue === "") {
        return "";
      }
      
      // Garantir que decimalValue seja string antes de usar includes()
      const strValue = String(decimalValue);
      
      // Se já está no formato HH:MM retorna como está
      if (strValue.includes(':')) {
        return strValue;
      }
      
      // Tenta converter o valor para número
      const decimal = parseFloat(strValue);
      if (isNaN(decimal)) {
        return strValue;
      }
      
      // Converte decimal para horas e minutos
      const totalMinutes = Math.round(decimal * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      // Formata como HH:MM
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error("Erro ao converter formato de hora:", error, decimalValue);
      return String(decimalValue); // Return as string in case of error
    }
  };

  const extractTimeOnly = (dateTimeValue: any): string => {
    try {
      if (dateTimeValue === undefined || dateTimeValue === null || dateTimeValue === "") {
        return "";
      }
      
      const strValue = String(dateTimeValue);
      
      // Se já está no formato HH:MM, retorna como está
      if (/^\d{1,2}:\d{2}$/.test(strValue)) {
        return strValue;
      }
      
      // Tenta extrair hora de uma string de data/hora
      if (strValue.includes('/') || strValue.includes('-')) {
        const dateObj = new Date(strValue);
        if (!isNaN(dateObj.getTime())) {
          return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        }
      }
      
      // Se é um valor decimal, usa a função de conversão existente
      return convertDecimalToTime(dateTimeValue);
    } catch (error) {
      console.error("Erro ao extrair horário:", error, dateTimeValue);
      return "";
    }
  };

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
        
        // Processar os dados para extrair apenas as colunas necessárias e formatar
        const processedData = parsedData.map((row: any) => {
          // Procura por colunas que podem conter data/hora
          const dateTimeColumns = Object.keys(row).filter(key => 
            key.toLowerCase().includes('data') || 
            key.toLowerCase().includes('hora') || 
            key.toLowerCase().includes('date') || 
            key.toLowerCase().includes('time')
          );
          
          // Procura por colunas que podem conter viagem TMS
          const viagemColumns = Object.keys(row).filter(key => 
            key.toLowerCase().includes('viagem') || 
            key.toLowerCase().includes('tms')
          );
          
          // Procura por colunas que podem conter frota
          const frotaColumns = Object.keys(row).filter(key => 
            key.toLowerCase().includes('frota') || 
            key.toLowerCase().includes('veiculo') || 
            key.toLowerCase().includes('veículo')
          );
          
          // Extrai os valores das colunas encontradas
          const horaValue = dateTimeColumns.length > 0 ? extractTimeOnly(row[dateTimeColumns[0]]) : "";
          
          // Extrai e converte viagem TMS para número
          let viagemValue = "";
          if (viagemColumns.length > 0) {
            const rawViagem = row[viagemColumns[0]];
            if (rawViagem !== undefined && rawViagem !== null) {
              viagemValue = String(Number(rawViagem.toString().replace(/[^\d]/g, '')));
            }
          }
          
          // Extrai frota como texto
          const frotaValue = frotaColumns.length > 0 ? String(row[frotaColumns[0]] || "") : "";
          
          const boxD = row["BOX-D"] || "";
          const status = boxD ? "PARCIAL" : (row.status || "LIVRE");
          
          return {
            ...row,
            HORA: horaValue,
            VIAGEM: viagemValue,
            FROTA: frotaValue,
            PREBOX: row.PREBOX || "",
            "BOX-D": boxD,
            status
          };
        });
        
        onUpload(processedData);
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
  
  // Função para processar e combinar dados de dois arquivos
  const processTwoFiles = async (files: File[]) => {
    if (files.length < 2) {
      toast.error("Necessário pelo menos dois arquivos para combinar");
      return;
    }
    
    setIsAutomaticLoading(true);
    
    try {
      const promises = files.slice(0, 2).map(file => {
        return new Promise<any[]>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = (e) => {
            try {
              const data = e.target?.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const parsedData = XLSX.utils.sheet_to_json(sheet);
              
              // Processar dados extraindo apenas o que precisamos
              const processedData = parsedData.map((row: any) => {
                // Procura por colunas que podem conter data/hora
                const dateTimeColumns = Object.keys(row).filter(key => 
                  key.toLowerCase().includes('data') || 
                  key.toLowerCase().includes('hora') || 
                  key.toLowerCase().includes('date') || 
                  key.toLowerCase().includes('time')
                );
                
                // Procura por colunas que podem conter viagem TMS
                const viagemColumns = Object.keys(row).filter(key => 
                  key.toLowerCase().includes('viagem') || 
                  key.toLowerCase().includes('tms')
                );
                
                // Procura por colunas que podem conter frota
                const frotaColumns = Object.keys(row).filter(key => 
                  key.toLowerCase().includes('frota') || 
                  key.toLowerCase().includes('veiculo') || 
                  key.toLowerCase().includes('veículo')
                );
                
                // Extrai os valores das colunas encontradas
                const horaValue = dateTimeColumns.length > 0 ? extractTimeOnly(row[dateTimeColumns[0]]) : "";
                
                // Extrai e converte viagem TMS para número
                let viagemValue = "";
                if (viagemColumns.length > 0) {
                  const rawViagem = row[viagemColumns[0]];
                  if (rawViagem !== undefined && rawViagem !== null) {
                    viagemValue = String(Number(rawViagem.toString().replace(/[^\d]/g, '')));
                  }
                }
                
                // Extrai frota como texto
                const frotaValue = frotaColumns.length > 0 ? String(row[frotaColumns[0]] || "") : "";
                
                return {
                  HORA: horaValue,
                  VIAGEM: viagemValue,
                  FROTA: frotaValue
                };
              });
              
              resolve(processedData);
            } catch (error) {
              console.error("Erro ao processar arquivo:", error);
              reject(error);
            }
          };
          
          reader.onerror = () => {
            reject(new Error("Erro ao ler o arquivo"));
          };
          
          reader.readAsBinaryString(file);
        });
      });
      
      // Aguardar processamento de ambos os arquivos
      const [data1, data2] = await Promise.all(promises);
      
      // Combinar os dados dos dois arquivos
      const combinedData = [...data1, ...data2];
      
      // Ordenar por hora
      combinedData.sort((a, b) => {
        const horaA = a.HORA.replace(':', '');
        const horaB = b.HORA.replace(':', '');
        return horaA.localeCompare(horaB);
      });
      
      // Formatar os dados para incluir colunas vazias para PREBOX e BOX-D
      const formattedData = combinedData.map(item => ({
        ...item,
        PREBOX: "",
        "BOX-D": "",
        status: "LIVRE"
      }));
      
      onUpload(formattedData);
      
      const fileNames = files.slice(0, 2).map(f => f.name).join(', ');
      setFileName(`Combinado: ${fileNames}`);
      toast.success("Arquivos combinados com sucesso!");
      
    } catch (error) {
      console.error("Erro ao combinar arquivos:", error);
      toast.error("Erro ao processar os arquivos");
    } finally {
      setIsAutomaticLoading(false);
    }
  };
  
  // Função para buscar automaticamente arquivos da pasta "Carregamento"
  const handleAutomaticFileSearch = async () => {
    try {
      // Note: No ambiente do navegador, não é possível acessar diretamente o sistema de arquivos
      // Precisamos usar um selecionador de arquivos e o usuário precisa selecionar manualmente
      
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.xlsx,.xls';
      
      // Quando o usuário selecionar os arquivos
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        
        if (!files || files.length < 2) {
          toast.error("Selecione pelo menos dois arquivos Excel");
          return;
        }
        
        // Converter FileList para Array para poder ordenar
        const filesArray = Array.from(files);
        
        // Ordenar por data de última modificação (mais recente primeiro)
        filesArray.sort((a, b) => {
          return b.lastModified - a.lastModified;
        });
        
        // Pegar os dois arquivos mais recentes
        const recentFiles = filesArray.slice(0, 2);
        
        // Processar os dois arquivos
        await processTwoFiles(recentFiles);
      };
      
      // Trigger the file selection dialog
      input.click();
      
    } catch (error) {
      console.error("Erro na busca automática:", error);
      toast.error("Erro ao buscar arquivos automaticamente");
    }
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
                disabled={isLoading || isAutomaticLoading}
              />
            </label>
          </div>
          <span className="ml-3 text-gray-600 text-sm truncate max-w-xs">{fileName}</span>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button
            onClick={handleAutomaticFileSearch}
            className="w-full sm:w-auto flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-sm"
            disabled={isLoading || isAutomaticLoading}
          >
            <FolderOpen size={16} />
            {isAutomaticLoading ? "Processando..." : "Buscar Arquivos Automaticamente"}
          </Button>
          
          <Button
            onClick={() => toast.info("Utilize o botão 'Escolher arquivo' para carregar uma planilha")}
            className="w-full sm:w-auto flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            disabled={isLoading || isAutomaticLoading}
          >
            <Upload size={16} />
            {isLoading ? "Processando..." : "Carregar Excel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
