import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

interface GestaoVaosProps {
  totalVaos: number;
  rampasPorVao: number;
  onUpdateConfig: (vaos: number, rampasPorVao: number) => void;
}

const GestaoVaos = ({ totalVaos, rampasPorVao, onUpdateConfig }: GestaoVaosProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<'add' | 'remove' | null>(null);
  const [novoVao, setNovoVao] = useState(totalVaos);
  const [novasRampas, setNovasRampas] = useState(rampasPorVao);

  const handleConfirmChange = () => {
    onUpdateConfig(novoVao, novasRampas);
    
    toast.success(`Agora temos ${novoVao} vãos com ${novasRampas} rampas cada`);
  };

  const adicionarVao = () => {
    setNovoVao(totalVaos + 1);
    setNovasRampas(rampasPorVao);
    setPendingAction('add');
    setShowConfirm(true);
  };

  const removerVao = () => {
    if (totalVaos > 1) {
      setNovoVao(totalVaos - 1);
      setNovasRampas(rampasPorVao);
      setPendingAction('remove');
      setShowConfirm(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gestão de Vãos e Rampas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Vãos</label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removerVao}
                  disabled={totalVaos <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={totalVaos}
                  readOnly
                  className="text-center h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={adicionarVao}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-600">Rampas por Vão</label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (rampasPorVao > 1) {
                      setNovoVao(totalVaos);
                      setNovasRampas(rampasPorVao - 1);
                      setPendingAction('remove');
                      setShowConfirm(true);
                    }
                  }}
                  disabled={rampasPorVao <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={rampasPorVao}
                  readOnly
                  className="text-center h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNovoVao(totalVaos);
                    setNovasRampas(rampasPorVao + 1);
                    setPendingAction('add');
                    setShowConfirm(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-slate-500 mt-2">
            Total de rampas: {totalVaos * rampasPorVao}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirmar Alteração"
        description={`Tem certeza que deseja alterar para ${novoVao} vãos com ${novasRampas} rampas cada? Isso irá resetar todas as alocações atuais.`}
        onConfirm={handleConfirmChange}
        confirmText="Confirmar Alteração"
        variant="destructive"
      />
    </>
  );
};

export default GestaoVaos;