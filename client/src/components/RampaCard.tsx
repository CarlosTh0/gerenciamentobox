import React, { useState } from 'react';
import { Package, Lock, Unlock, Minus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmDialog from './ConfirmDialog';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
}

interface RampaCardProps {
  rampa: number;
  galpao: number;
  frotaOcupando?: Frota;
  isBloqueada: boolean;
  onToggleBloqueio: (rampa: number, galpao: number) => void;
  onToggleCarregada: (frotaId: string) => void;
  onRemoverFrota: (frotaId: string) => void;
  onFinalizarCarregamento: (frotaId: string) => void;
}

const RampaCard = ({
  rampa,
  galpao,
  frotaOcupando,
  isBloqueada,
  onToggleBloqueio,
  onToggleCarregada,
  onRemoverFrota,
  onFinalizarCarregamento
}: RampaCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'block' | 'unblock' | 'remove' | 'finish';
    data?: any;
  } | null>(null);

  const isOcupada = !!frotaOcupando;
  const isCarregada = frotaOcupando?.carregada;

  const handleAction = (type: 'block' | 'unblock' | 'remove' | 'finish', data?: any) => {
    setConfirmAction({ type, data });
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'block':
      case 'unblock':
        onToggleBloqueio(rampa, galpao);
        break;
      case 'remove':
        onRemoverFrota(confirmAction.data);
        break;
      case 'finish':
        onFinalizarCarregamento(confirmAction.data);
        break;
    }
  };

  const getConfirmContent = () => {
    if (!confirmAction) return { title: '', description: '' };

    switch (confirmAction.type) {
      case 'block':
        return {
          title: 'Bloquear Rampa',
          description: `Tem certeza que deseja bloquear a Rampa ${rampa}? Ela ficará indisponível para novas alocações.`
        };
      case 'unblock':
        return {
          title: 'Desbloquear Rampa',
          description: `Tem certeza que deseja desbloquear a Rampa ${rampa}? Ela ficará disponível para alocações.`
        };
      case 'remove':
        return {
          title: 'Remover Frota',
          description: `Tem certeza que deseja remover a frota ${frotaOcupando?.numero} da Rampa ${rampa}? Ela retornará ao pátio.`
        };
      case 'finish':
        return {
          title: 'Finalizar Carregamento',
          description: `Tem certeza que deseja finalizar o carregamento da frota ${frotaOcupando?.numero}? Ela será despachada e a rampa ficará livre.`
        };
      default:
        return { title: '', description: '' };
    }
  };

  return (
    <>
      <div
        className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
          isBloqueada
            ? 'bg-red-50 border-red-300'
            : isOcupada 
              ? isCarregada 
                ? 'bg-purple-50 border-purple-300 shadow-purple-200 shadow-lg' 
                : 'bg-orange-50 border-orange-300 shadow-orange-200 shadow-lg'
              : 'bg-green-50 border-green-300 hover:bg-green-100 hover:shadow-green-200 hover:shadow-md'
        }`}
      >
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            Rampa {rampa}
          </p>
          {isBloqueada ? (
            <div className="mt-1 space-y-1 sm:space-y-2">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mx-auto" strokeWidth={1.5} />
              <p className="text-xs font-bold text-red-700">BLOQUEADA</p>
              <Button
                size="sm"
                variant="outline"
                className="h-5 sm:h-6 text-xs border-red-300 w-full px-1"
                onClick={() => handleAction('unblock')}
              >
                <Unlock className="h-3 w-3" />
              </Button>
            </div>
          ) : isOcupada ? (
            <div className="mt-1 space-y-1 sm:space-y-2">
              <svg 
                className={`h-3 w-3 sm:h-4 sm:w-4 mx-auto ${
                  isCarregada ? 'text-purple-600' : 'text-orange-600'
                }`} 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M20 8h-3l-1.5-4.5c-.3-.8-1.1-1.5-2-1.5H8c-.9 0-1.7.7-2 1.5L4.5 8H2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2v1c0 .6.4 1 1 1s1-.4 1-1v-1h12v1c0 .6.4 1 1 1s1-.4 1-1v-1h2c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM7.5 4.5c.1-.3.4-.5.7-.5h7.6c.3 0 .6.2.7.5L17.5 8h-11L7.5 4.5zM4 16c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm16 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
              </svg>
              <p className={`text-xs font-bold ${
                isCarregada ? 'text-purple-700' : 'text-orange-700'
              }`}>
                {frotaOcupando.numero}
              </p>
              <div className="flex items-center justify-center space-x-1 mb-1 sm:mb-2">
                <Checkbox
                  checked={isCarregada}
                  onCheckedChange={() => onToggleCarregada(frotaOcupando.id)}
                  className="h-3 w-3"
                />
                <span className="text-xs">Carregada</span>
              </div>
              <div className="flex justify-center space-x-1">
                {isCarregada && (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-5 sm:h-6 text-xs bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-110 px-1 sm:px-2"
                    onClick={() => handleAction('finish', frotaOcupando.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                )}
                {!isCarregada && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 sm:h-6 text-xs transition-all duration-200 hover:scale-110 px-1 sm:px-2"
                    onClick={() => handleAction('remove', frotaOcupando.id)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-5 sm:h-6 text-xs border-red-300 transition-all duration-200 hover:scale-110 px-1 sm:px-2"
                  onClick={() => handleAction('block')}
                  disabled={isCarregada}
                >
                  <Lock className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-1 sm:space-y-2">
              <p className="text-xs text-green-600 font-medium">
                Livre
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-5 sm:h-6 text-xs border-red-300 transition-all duration-200 hover:scale-110 w-full px-1"
                onClick={() => handleAction('block')}
              >
                <Lock className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={getConfirmContent().title}
        description={getConfirmContent().description}
        onConfirm={executeAction}
        confirmText="Confirmar"
        variant={confirmAction?.type === 'remove' || confirmAction?.type === 'finish' ? 'destructive' : 'default'}
      />
    </>
  );
};

export default RampaCard;