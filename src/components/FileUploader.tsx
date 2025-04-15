
import { useState } from "react";

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center">
        <label className="relative cursor-pointer">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
          />
          <span className="border border-gray-300 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors">
            Escolher arquivo
          </span>
        </label>
        <span className="ml-2 text-gray-600">{fileName}</span>
      </div>
      
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
        onClick={onUpload}
      >
        Carregar Novo Excel
      </button>
    </div>
  );
};

export default FileUploader;
