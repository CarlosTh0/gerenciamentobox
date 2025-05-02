
import { useState, useEffect } from 'react';
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Registro de Alterações</h1>
      <AlteracoesCard alteracoes={alteracoes} />
    </div>
  );
}
