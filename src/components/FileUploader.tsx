
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Upload } from "lucide-react";

interface FileUploaderProps {
  onUpload: () => void;
}

const FileUploader = ({ onUpload }: FileUploaderProps) => {
  const [fileName, setFileName] = useState("Nenhum arquivo escolhido");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
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
              />
            </label>
          </div>
          <span className="ml-3 text-gray-600 text-sm truncate max-w-xs">{fileName}</span>
        </div>
        
        <Button
          onClick={onUpload}
          className="w-full sm:w-auto flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
        >
          <Upload size={16} />
          Carregar Excel
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;
