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
                <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 8h-3l-1.5-4.5c-.3-.8-1.1-1.5-2-1.5H8c-.9 0-1.7.7-2 1.5L4.5 8H2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2v1c0 .6.4 1 1 1s1-.4 1-1v-1h12v1c0 .6.4 1 1 1s1-.4 1-1v-1h2c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM7.5 4.5c.1-.3.4-.5.7-.5h7.6c.3 0 .6.2.7.5L17.5 8h-11L7.5 4.5zM4 16c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm16 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                </svg>
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