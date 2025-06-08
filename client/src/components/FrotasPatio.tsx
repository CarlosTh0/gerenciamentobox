import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
}

interface FrotasPatioProps {
  frotas: Frota[];
  onAlocarFrota: (frotaId: string, rampa: number, galpao: number) => void;
  rampaOcupada: (rampa: number, galpao: number) => Frota | undefined;
  rampaEstaBloqueada: (rampa: number, galpao: number) => boolean;
  totalRampas: number;
  rampasPorVao: number;
}

const FrotasPatio = ({ 
  frotas, 
  onAlocarFrota, 
  rampaOcupada, 
  rampaEstaBloqueada, 
  totalRampas, 
  rampasPorVao 
}: FrotasPatioProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Frotas no Pátio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {frotas.map(frota => (
            <div
              key={frota.id}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-200 hover:shadow-md hover:bg-green-100"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  {frota.numero}
                </span>
              </div>
              <select
                className="text-sm border rounded px-2 py-1 transition-all duration-200 hover:border-green-400 focus:border-green-500"
                onChange={(e) => {
                  if (e.target.value) {
                    const [rampa, galpao] = e.target.value.split('-').map(Number);
                    onAlocarFrota(frota.id, rampa, galpao);
                  }
                }}
                defaultValue=""
              >
                <option value="">Alocar</option>
                {Array.from({ length: totalRampas }, (_, i) => {
                  const rampa = i + 1;
                  const galpao = Math.ceil(rampa / rampasPorVao);
                  const ocupada = rampaOcupada(rampa, galpao);
                  const bloqueada = rampaEstaBloqueada(rampa, galpao);
                  
                  if (ocupada || bloqueada) return null;
                  
                  return (
                    <option key={rampa} value={`${rampa}-${galpao}`}>
                      Rampa {rampa} (V{galpao})
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
          
          {frotas.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              Nenhuma frota no pátio
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FrotasPatio;