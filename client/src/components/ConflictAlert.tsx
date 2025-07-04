
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConflictAlertProps {
  conflicts: {
    boxD: string;
    viagens: string[];
  }[];
}

const ConflictAlert = ({ conflicts }: ConflictAlertProps) => {
  if (conflicts.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-6 border-red-400 bg-red-50">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="font-semibold text-red-700">
        {conflicts.length === 1 ? "1 conflito detectado!" : `${conflicts.length} conflitos detectados!`}
      </AlertTitle>
      <AlertDescription className="text-red-600">
        <p className="text-sm mt-1">É necessário resolver os seguintes conflitos para evitar problemas de agendamento:</p>
        <ul className="mt-2 text-sm space-y-1 list-disc pl-5">
          {conflicts.map((conflict, index) => (
            <li key={index}>
              <strong>BOX-D {conflict.boxD}:</strong> Conflito entre viagens{" "}
              {conflict.viagens.join(", ")}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default ConflictAlert;
