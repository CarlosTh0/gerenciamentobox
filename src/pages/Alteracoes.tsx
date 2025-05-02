
import { useState, useEffect } from 'react';
import AlteracoesCard, { Alteracao } from '@/components/AlteracoesCard';

export default function Alteracoes() {
  const [alteracoes, setAlteracoes] = useState<Alteracao[]>([]);

  useEffect(() => {
    // Aqui você pode carregar as alterações do localStorage ou de uma API
    const alteracoesFromStorage = localStorage.getItem('alteracoes');
    if (alteracoesFromStorage) {
      setAlteracoes(JSON.parse(alteracoesFromStorage).map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      })));
    }
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Registro de Alterações</h1>
      <AlteracoesCard alteracoes={alteracoes} />
    </div>
  );
}
