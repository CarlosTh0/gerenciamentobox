
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, AlertCircle, Clock } from "lucide-react";

interface CargasTableProps {
  data: any[];
}

const CargasTable = ({ data }: CargasTableProps) => {
  return (
    <Card className="overflow-hidden border border-gray-100 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <TableHeader>HORA</TableHeader>
              <TableHeader>VIAGEM</TableHeader>
              <TableHeader>FROTA</TableHeader>
              <TableHeader>PREBOX</TableHeader>
              <TableHeader>BOX-D</TableHeader>
              <TableHeader>STATUS</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={index} row={row} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhum dado disponível
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{children}</th>
);

const TableRow = ({ row }: { row: any }) => {
  const [status, setStatus] = useState("LIVRE");
  
  const getStatusStyles = (status: string) => {
    switch(status) {
      case "LIVRE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "OCUPADO":
        return "bg-red-50 text-red-700 border-red-200";
      case "PENDENTE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "LIVRE":
        return <Check className="w-4 h-4 text-emerald-500" />;
      case "OCUPADO":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "PENDENTE":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };
  
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        {row.HORA || (
          <input 
            type="text" 
            className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            placeholder="--" 
          />
        )}
      </td>
      <td className="px-6 py-4">
        {row.VIAGEM || (
          <input 
            type="text" 
            className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
            placeholder="" 
          />
        )}
      </td>
      <td className="px-6 py-4">
        {row.FROTA || (
          <input 
            type="text" 
            className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
            placeholder="" 
          />
        )}
      </td>
      <td className="px-6 py-4">
        {row.PREBOX || (
          <input 
            type="text" 
            className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
            placeholder="" 
          />
        )}
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          className="w-full border border-gray-200 px-3 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
          defaultValue={row["BOX-D"] || ""}
          placeholder="" 
        />
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          <select
            className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded text-sm border ${getStatusStyles(status)} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="LIVRE">LIVRE</option>
            <option value="OCUPADO">OCUPADO</option>
            <option value="PENDENTE">PENDENTE</option>
          </select>
          <div className="absolute inset-y-0 right-0.5 flex items-center pr-2 pointer-events-none">
            {getStatusIcon(status)}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default CargasTable;
