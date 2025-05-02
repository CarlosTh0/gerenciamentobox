
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface Alteracao {
  id: string;
  timestamp: Date;
  tipo: 'atualização' | 'criação' | 'exclusão';
  dados: {
    FROTA?: string;
    VIAGEM?: string;
    "BOX-D"?: string;
    [key: string]: string | undefined;
  };
}

interface AlteracoesCardProps {
  alteracoes: Alteracao[];
}

export default function AlteracoesCard({ alteracoes }: AlteracoesCardProps) {
  return (
    <div className="space-y-4 p-4">
      {alteracoes.map((alteracao) => (
        <Card key={alteracao.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                alteracao.tipo === 'atualização' ? 'bg-blue-100 text-blue-700' :
                alteracao.tipo === 'criação' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {alteracao.tipo.charAt(0).toUpperCase() + alteracao.tipo.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(alteracao.timestamp, { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(alteracao.dados).map(([chave, valor]) => (
                valor && (
                  <div key={chave} className="flex flex-col">
                    <span className="text-sm font-medium text-gray-600">{chave}:</span>
                    <span className="text-lg">{valor}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
