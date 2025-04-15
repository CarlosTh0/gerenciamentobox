
import { useState } from "react";

interface CargasTableProps {
  data: any[];
}

const CargasTable = ({ data }: CargasTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <TableHeader>HORA</TableHeader>
            <TableHeader>VIAGEM</TableHeader>
            <TableHeader>FROTA</TableHeader>
            <TableHeader>PREBOX</TableHeader>
            <TableHeader>BOX-D</TableHeader>
            <TableHeader>STATUS</TableHeader>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={index} row={row} />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 border">
                Nenhum dado disponível
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="border px-4 py-2 text-center">{children}</th>
);

const TableRow = ({ row }: { row: any }) => {
  const [status, setStatus] = useState("LIVRE");
  
  return (
    <tr>
      <td className="border px-4 py-2 text-center">
        {row.HORA || (
          <input 
            type="text" 
            className="w-full border border-gray-300 px-2 py-1 rounded"
            placeholder="--" 
          />
        )}
      </td>
      <td className="border px-4 py-2">
        {row.VIAGEM || (
          <input 
            type="text" 
            className="w-full border border-gray-300 px-2 py-1 rounded" 
            placeholder="" 
          />
        )}
      </td>
      <td className="border px-4 py-2">
        {row.FROTA || (
          <input 
            type="text" 
            className="w-full border border-gray-300 px-2 py-1 rounded" 
            placeholder="" 
          />
        )}
      </td>
      <td className="border px-4 py-2">
        {row.PREBOX || (
          <input 
            type="text" 
            className="w-full border border-gray-300 px-2 py-1 rounded" 
            placeholder="" 
          />
        )}
      </td>
      <td className="border px-4 py-2">
        <input 
          type="text" 
          className="w-full border border-gray-300 px-2 py-1 rounded" 
          defaultValue={row["BOX-D"] || ""}
          placeholder="" 
        />
      </td>
      <td className="border px-4 py-2">
        <select
          className="w-full border border-gray-300 px-2 py-1 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="LIVRE">LIVRE</option>
          <option value="OCUPADO">OCUPADO</option>
          <option value="PENDENTE">PENDENTE</option>
        </select>
      </td>
    </tr>
  );
};

export default CargasTable;
