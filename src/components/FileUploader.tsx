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

  const convertDecimalToTime = (decimalValue: any): string => {
    try {
      if (decimalValue === undefined || decimalValue === null || decimalValue === "") {
        return "";
      }

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
      console.error("Erro ao converter formato de hora:", error, decimalValue);
      return String(decimalValue);
    }
  };

  const extractTimeOnly = (dateTimeValue: any): string => {
    try {
      if (dateTimeValue === undefined || dateTimeValue === null || dateTimeValue === "") {
        return "";
      }

      const strValue = String(dateTimeValue);

      if (/^\d{1,2}:\d{2}$/.test(strValue)) {
        return strValue;
      }

      if (strValue.includes('/') || strValue.includes('-')) {
        const dateObj = new Date(strValue);
        if (!isNaN(dateObj.getTime())) {
          return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        }
      }

      return convertDecimalToTime(dateTimeValue);
    } catch (error) {
      console.error("Erro ao extrair horário:", error, dateTimeValue);
      return "";
    }
  };

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

              // Log headers para debug
              if (parsedData.length > 0) {
                console.log("Colunas disponíveis:", Object.keys(parsedData[0]));
              }

              const processedData = parsedData.map((row: any) => {
                const dateTimeColumns = Object.keys(row).filter(key => 
                  key.toLowerCase().includes('data') || 
                  key.toLowerCase().includes('hora') || 
                  key.toLowerCase().includes('date') || 
                  key.toLowerCase().includes('time')
                );

                // Busca específica pela coluna "Viagem TMS" (coluna G)
                let viagemValue = "";

                // Verifica diretamente a coluna G ou "Viagem TMS" com prioridade
                if (row["Viagem TMS"] !== undefined) {
                  viagemValue = String(row["Viagem TMS"] || "").trim();
                } else if (row["G"] !== undefined) {
                  viagemValue = String(row["G"] || "").trim();
                } else if (row["VIAGEM TMS"] !== undefined) {
                  viagemValue = String(row["VIAGEM TMS"] || "").trim();
                } else {
                  // Tenta encontrar pela palavra-chave 'viagem' e 'tms' juntos
                  const viagemTmsColumns = Object.keys(row).filter(key => 
                    key.toLowerCase().includes('viagem') && 
                    key.toLowerCase().includes('tms')
                  );

                  if (viagemTmsColumns.length > 0) {
                    viagemValue = String(row[viagemTmsColumns[0]] || "").trim();
                  } else {
                    // Última tentativa com qualquer coluna que mencione viagem
                    const viagemColumns = Object.keys(row).filter(key => 
                      key.toLowerCase().includes('viagem')
                    );

                    if (viagemColumns.length > 0) {
                      viagemValue = String(row[viagemColumns[0]] || "").trim();
                    }
                  }
                }

                const frotaColumns = Object.keys(row).filter(key => 
                  key.toLowerCase().includes('frota') || 
                  key.toLowerCase().includes('veiculo') || 
                  key.toLowerCase().includes('veículo')
                );

                const horaValue = dateTimeColumns.length > 0 ? extractTimeOnly(row[dateTimeColumns[0]]) : "";
                const frotaValue = frotaColumns.length > 0 ? String(row[frotaColumns[0]] || "") : "";

                return {
                  HORA: horaValue,
                  VIAGEM: viagemValue,
                  FROTA: frotaValue,
                  PREBOX: "",
                  "BOX-D": "",
                  status: "LIVRE"
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

      const [data1, data2] = await Promise.all(promises);

      const combinedData = [...data1, ...data2];

      combinedData.sort((a, b) => {
        const horaA = a.HORA.replace(':', '');
        const horaB = b.HORA.replace(':', '');
        return horaA.localeCompare(horaB);
      });

      onUpload(combinedData);

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

  const handleAutomaticFileSearch = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.xlsx,.xls';

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;

        if (!files || files.length < 2) {
          toast.error("Selecione pelo menos dois arquivos Excel");
          return;
        }

        const filesArray = Array.from(files);

        filesArray.sort((a, b) => {
          return b.lastModified - a.lastModified;
        });

        const recentFiles = filesArray.slice(0, 2);

        await processTwoFiles(recentFiles);
      };

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

        // Log headers para debug
        if (parsedData.length > 0) {
          console.log("Colunas disponíveis:", Object.keys(parsedData[0]));
        }

        const viagensSet = new Set();
        const duplicateViagens: string[] = [];

        const processedData = parsedData.map((row: any) => {
          const horaValue = row.HORAS || row.HORA || "";

          // Busca específica pela coluna "Viagem TMS" (coluna G)
          let viagemValue = "";

          if (row["Viagem TMS"] !== undefined) {
            viagemValue = String(row["Viagem TMS"] || "").trim();
          } else if (row["G"] !== undefined) {
            viagemValue = String(row["G"] || "").trim();
          } else if (row["VIAGEM TMS"] !== undefined) {
            viagemValue = String(row["VIAGEM TMS"] || "").trim();
          } else {
            viagemValue = String(row.VIAGEM || "").trim();
          }

          const frotaValue = String(row.FROTA || "").trim();
          const preBoxValue = row["PRÉ BOX"] || row["PRE BOX"] || row.PREBOX || "";
          const boxDValue = row["BOX DENTRO"] || row["BOX-D"] || "";

          const data = row.DATA || "";
          const viagemAntiga = row["VIAGEM ANTIGA"] || "";
          const km = row.KM || "";
          const quantidade = row.QUANTIDADE || "";
          const turno = row.TURNO || "";
          const tipoCarga = row["TIPO DE CARGA"] || "";
          const regiao = row.REGIÃO || row.REGIAO || "";
          const situacao = row.SITUAÇÃO || row.SITUACAO || "LIVRE";
          const troca = row.TROCA || "";
          const dataPrevManifesto = row["Data Prev. Do Manifesto"] || "";
          const agendada = row.AGENDADA || "";

          if (!viagensSet.has(viagemValue)) {
            viagensSet.add(viagemValue);
          } else {
            duplicateViagens.push(viagemValue);
          }

          return {
            DATA: data,
            HORA: horaValue,
            VIAGEM: viagemValue,
            "VIAGEM ANTIGA": viagemAntiga,
            KM: km,
            FROTA: frotaValue,
            PREBOX: preBoxValue,
            "BOX-D": boxDValue,
            QUANTIDADE: quantidade,
            TURNO: turno,
            "TIPO DE CARGA": tipoCarga,
            REGIAO: regiao,
            status: boxDValue ? "PARCIAL" : (situacao || "LIVRE"),
            TROCA: troca,
            "DATA PREV MANIFESTO": dataPrevManifesto,
            AGENDADA: agendada
          };
        });

        if (duplicateViagens.length > 0) {
          toast.warn(`As seguintes viagens estão duplicadas: ${duplicateViagens.join(', ')}`);
        }

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