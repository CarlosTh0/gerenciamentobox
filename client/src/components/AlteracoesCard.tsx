
import { Card } from "@/components/ui/card";

export interface Alteracao {
  id: string;
  timestamp: Date;
  tipo: 'criação' | 'atualização' | 'exclusão';
  dados: {
    FROTA?: string;
    "BOX-D"?: string;
    VIAGEM?: string;
    [key: string]: any;
  };
}

export default function AlteracoesCard({ alteracoes }: { alteracoes: Alteracao[] }) {
  if (!alteracoes || alteracoes.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">Nenhuma alteração registrada</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alteracoes.map((alteracao) => (
        <Card key={alteracao.id} className="p-4 bg-muted/30">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {alteracao.tipo}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(alteracao.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 text-sm">
              {alteracao.dados.FROTA && (
                <p>FROTA: <span className="font-medium">{alteracao.dados.FROTA}</span></p>
              )}
              {alteracao.dados["BOX-D"] && (
                <p>BOX-D: <span className="font-medium">{alteracao.dados["BOX-D"]}</span></p>
              )}
              {alteracao.dados.VIAGEM && (
                <p>VIAGEM: <span className="font-medium">{alteracao.dados.VIAGEM}</span></p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
