
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AlteracoesCard, { Alteracao } from '@/components/AlteracoesCard';

export default function Alteracoes() {
  const [alteracoes, setAlteracoes] = useState<Alteracao[]>([]);

  useEffect(() => {
    const alteracoesFromStorage = localStorage.getItem('alteracoes');
    if (alteracoesFromStorage) {
      try {
        const parsedAlteracoes = JSON.parse(alteracoesFromStorage);
        const processedAlteracoes = parsedAlteracoes
          .map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }))
          .sort((a: Alteracao, b: Alteracao) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          );
        setAlteracoes(processedAlteracoes);
      } catch (error) {
        console.error('Erro ao processar alterações:', error);
      }
    }
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('alteracoes');
    setAlteracoes([]);
    toast.success('Histórico de alterações limpo com sucesso');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registro de Alterações</h1>
        {alteracoes.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleClearHistory}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Histórico
          </Button>
        )}
      </div>
      <AlteracoesCard alteracoes={alteracoes} />
    </div>
  );
}
