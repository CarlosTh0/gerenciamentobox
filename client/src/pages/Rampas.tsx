import React, { useState } from 'react';
import { Warehouse, Plus, Filter, Package, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import RampaCard from '@/components/RampaCard';

interface Frota {
  id: string;
  numero: string;
  status: 'patio' | 'rampa' | 'despachada';
  rampa?: number;
  galpao?: number;
  carregada?: boolean;
  rampaDespacho?: number;
  galpaoDespacho?: number;
}

interface RampaBloqueada {
  rampa: number;
  galpao: number;
  bloqueada: boolean;
}

const Rampas = () => {
  const [totalVaos, setTotalVaos] = useState(4);
  const [rampasPorVao, setRampasPorVao] = useState(4);
  const [frotas, setFrotas] = useState<Frota[]>([
    { id: '1', numero: 'CEG-001', status: 'patio' },
    { id: '2', numero: 'CEG-002', status: 'patio' },
    { id: '3', numero: 'CEG-003', status: 'rampa', rampa: 1, galpao: 1, carregada: false },
    { id: '4', numero: 'CEG-004', status: 'rampa', rampa: 5, galpao: 2, carregada: true },
  ]);
  
  const [rampasBloqueadas, setRampasBloqueadas] = useState<RampaBloqueada[]>([]);
  const [novaFrota, setNovaFrota] = useState('');
  const [filtroDespachadas, setFiltroDespachadas] = useState('');

  const updateConfig = (vaos: number, rampas: number) => {
    // Remove frotas que estão em rampas que não existem mais
    setFrotas(prev => prev.map(frota => {
      if (frota.status === 'rampa' && frota.rampa && frota.galpao) {
        const novaRampa = (frota.galpao - 1) * rampas + (frota.rampa - 1) % rampas + 1;
        if (frota.galpao > vaos || novaRampa > rampas * vaos) {
          return { ...frota, status: 'patio', rampa: undefined, galpao: undefined, carregada: undefined };
        }
      }
      return frota;
    }));

    // Remove bloqueios de rampas que não existem mais
    setRampasBloqueadas(prev => 
      prev.filter(r => r.galpao <= vaos && r.rampa <= rampas * vaos)
    );

    setTotalVaos(vaos);
    setRampasPorVao(rampas);
  };

  const toggleBloqueioRampa = (rampa: number, galpao: number) => {
    const rampaExistente = rampasBloqueadas.find(r => r.rampa === rampa && r.galpao === galpao);
    
    if (rampaExistente) {
      setRampasBloqueadas(prev => 
        prev.map(r => 
          r.rampa === rampa && r.galpao === galpao 
            ? { ...r, bloqueada: !r.bloqueada }
            : r
        )
      );
      
      toast.success(rampaExistente.bloqueada ? "Rampa Desbloqueada" : "Rampa Bloqueada");
    } else {
      setRampasBloqueadas(prev => [...prev, { rampa, galpao, bloqueada: true }]);
      toast.success("Rampa Bloqueada");
    }
  };

  const rampaEstaBloqueada = (rampa: number, galpao: number) => {
    const rampaBloqueada = rampasBloqueadas.find(r => r.rampa === rampa && r.galpao === galpao);
    return rampaBloqueada?.bloqueada || false;
  };

  const alocarFrota = (frotaId: string, rampa: number, galpao: number) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'rampa', rampa, galpao, carregada: false }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast.success(`${frota?.numero} foi alocada na Rampa ${rampa}, Vão ${galpao}`);
  };

  const removerFrota = (frotaId: string) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, status: 'patio', rampa: undefined, galpao: undefined, carregada: undefined }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    toast.success(`${frota?.numero} retornou ao pátio`);
  };

  const toggleCarregada = (frotaId: string) => {
    setFrotas(prev => prev.map(frota => 
      frota.id === frotaId 
        ? { ...frota, carregada: !frota.carregada }
        : frota
    ));
    
    const frota = frotas.find(f => f.id === frotaId);
    const novoStatus = !frota?.carregada;
    toast.success(`${frota?.numero} ${novoStatus ? 'carregada' : 'descarregada'}`);
  };

  const finalizarCarregamento = (frotaId: string) => {
    const frota = frotas.find(f => f.id === frotaId);
    
    setFrotas(prev => prev.map(f => 
      f.id === frotaId 
        ? { 
            ...f, 
            status: 'despachada', 
            rampaDespacho: f.rampa, 
            galpaoDespacho: f.galpao,
            rampa: undefined, 
            galpao: undefined,
            carregada: undefined 
          }
        : f
    ));
    
    toast.success(`${frota?.numero} foi despachada com sucesso!`);
  };

  const adicionarFrota = () => {
    if (!novaFrota.trim()) {
      toast.error("Digite um número de frota válido");
      return;
    }

    if (frotas.some(f => f.numero === novaFrota)) {
      toast.error("Esta frota já existe");
      return;
    }

    const novaFrotaObj: Frota = {
      id: Date.now().toString(),
      numero: novaFrota,
      status: 'patio'
    };

    setFrotas(prev => [...prev, novaFrotaObj]);
    setNovaFrota('');
    toast.success(`Frota ${novaFrota} adicionada ao pátio`);
  };

  const rampaOcupada = (rampa: number, galpao: number) => {
    return frotas.find(f => f.status === 'rampa' && f.rampa === rampa && f.galpao === galpao);
  };

  const frotasPatio = frotas.filter(f => f.status === 'patio');
  const frotasNasRampas = frotas.filter(f => f.status === 'rampa');
  const frotasDespachadas = frotas.filter(f => f.status === 'despachada');
  const frotasDespachadasFiltradas = frotasDespachadas.filter(f => 
    f.numero.toLowerCase().includes(filtroDespachadas.toLowerCase())
  );

  const totalRampas = totalVaos * rampasPorVao;
  const rampasOcupadas = frotasNasRampas.length;
  const rampasLivres = totalRampas - rampasOcupadas - rampasBloqueadas.filter(r => r.bloqueada).length;
  const rampasBloqueadasCount = rampasBloqueadas.filter(r => r.bloqueada).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2 md:gap-3">
            <Warehouse className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-600" />
            Controle de Rampas
          </h1>
          <p className="text-sm sm:text-base text-slate-600">Sistema de gestão de frotas e rampas de carregamento</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-blue-50 border-blue-200 border-2 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Total de Rampas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{totalRampas}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200 border-2 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-700">Rampas Livres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{rampasLivres}</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200 border-2 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-700">Rampas Ocupadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{rampasOcupadas}</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200 border-2 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-red-700">Rampas Bloqueadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{rampasBloqueadasCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
          {/* Rampas Grid */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Rampas de Carregamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 md:space-y-6">
                  {Array.from({ length: totalVaos }, (_, vaoIndex) => (
                    <div key={vaoIndex + 1} className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-700 border-b pb-2">
                        Vão {vaoIndex + 1}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                        {Array.from({ length: rampasPorVao }, (_, rampaIndex) => {
                          const rampaNumero = vaoIndex * rampasPorVao + rampaIndex + 1;
                          const galpaoNumero = vaoIndex + 1;
                          const frotaOcupando = rampaOcupada(rampaNumero, galpaoNumero);
                          const bloqueada = rampaEstaBloqueada(rampaNumero, galpaoNumero);
                          
                          return (
                            <RampaCard
                              key={rampaNumero}
                              rampa={rampaNumero}
                              galpao={galpaoNumero}
                              frotaOcupando={frotaOcupando}
                              isBloqueada={bloqueada}
                              onToggleBloqueio={toggleBloqueioRampa}
                              onToggleCarregada={toggleCarregada}
                              onRemoverFrota={removerFrota}
                              onFinalizarCarregamento={finalizarCarregamento}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Gestão de Vãos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Gestão de Vãos e Rampas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Vãos</label>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (totalVaos > 1) {
                            updateConfig(totalVaos - 1, rampasPorVao);
                            toast.success(`Agora temos ${totalVaos - 1} vãos com ${rampasPorVao} rampas cada`);
                          }
                        }}
                        disabled={totalVaos <= 1}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={totalVaos}
                        readOnly
                        className="text-center h-7 text-xs sm:text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateConfig(totalVaos + 1, rampasPorVao);
                          toast.success(`Agora temos ${totalVaos + 1} vãos com ${rampasPorVao} rampas cada`);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-600">Rampas por Vão</label>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (rampasPorVao > 1) {
                            updateConfig(totalVaos, rampasPorVao - 1);
                            toast.success(`Agora temos ${totalVaos} vãos com ${rampasPorVao - 1} rampas cada`);
                          }
                        }}
                        disabled={rampasPorVao <= 1}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={rampasPorVao}
                        readOnly
                        className="text-center h-7 text-xs sm:text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateConfig(totalVaos, rampasPorVao + 1);
                          toast.success(`Agora temos ${totalVaos} vãos com ${rampasPorVao + 1} rampas cada`);
                        }}
                        className="h-7 w-7 p-0"
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

            {/* Adicionar Nova Frota */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Adicionar Nova Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: CEG-005"
                    value={novaFrota}
                    onChange={(e) => setNovaFrota(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarFrota()}
                    className="text-sm"
                  />
                  <Button onClick={adicionarFrota} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Frotas no Pátio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Frotas no Pátio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                  {frotasPatio.map(frota => (
                    <div
                      key={frota.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200 transition-all duration-200 hover:shadow-md hover:bg-green-100"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 8h-3l-1.5-4.5c-.3-.8-1.1-1.5-2-1.5H8c-.9 0-1.7.7-2 1.5L4.5 8H2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2v1c0 .6.4 1 1 1s1-.4 1-1v-1h12v1c0 .6.4 1 1 1s1-.4 1-1v-1h2c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM7.5 4.5c.1-.3.4-.5.7-.5h7.6c.3 0 .6.2.7.5L17.5 8h-11L7.5 4.5zM4 16c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm16 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
                        </svg>
                        <span className="font-medium text-green-800 text-sm">
                          {frota.numero}
                        </span>
                      </div>
                      <select
                        className="text-xs sm:text-sm border rounded px-2 py-1 transition-all duration-200 hover:border-green-400 focus:border-green-500"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [rampa, galpao] = e.target.value.split('-').map(Number);
                            alocarFrota(frota.id, rampa, galpao);
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
                  
                  {frotasPatio.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">
                      Nenhuma frota no pátio
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Frotas Despachadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Frotas Despachadas ({frotasDespachadas.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Filtrar frotas..."
                      value={filtroDespachadas}
                      onChange={(e) => setFiltroDespachadas(e.target.value)}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    {frotasDespachadasFiltradas.map(frota => (
                      <div
                        key={frota.id}
                        className="p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 8h-3l-1.5-4.5c-.3-.8-1.1-1.5-2-1.5H8c-.9 0-1.7.7-2 1.5L4.5 8H2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2v1c0 .6.4 1 1 1s1-.4 1-1v-1h12v1c0 .6.4 1 1 1s1-.4 1-1v-1h2c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zM7.5 4.5c.1-.3.4-.5.7-.5h7.6c.3 0 .6.2.7.5L17.5 8h-11L7.5 4.5zM4 16c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm16 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM12 10h4v4h-4v-4z"/>
                            </svg>
                            <span className="font-medium text-purple-800 text-sm">
                              {frota.numero}
                            </span>
                          </div>
                          <span className="text-xs text-purple-600 font-medium">
                            Despachada
                          </span>
                        </div>
                        {frota.rampaDespacho && (
                          <div className="text-xs text-slate-600">
                            Rampa {frota.rampaDespacho} - Vão {frota.galpaoDespacho}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {frotasDespachadasFiltradas.length === 0 && frotasDespachadas.length > 0 && (
                      <p className="text-center text-slate-500 py-6 sm:py-8 text-sm">
                        Nenhuma frota encontrada com esse filtro
                      </p>
                    )}
                    
                    {frotasDespachadas.length === 0 && (
                      <p className="text-center text-slate-500 py-6 sm:py-8 text-sm">
                        Nenhuma frota despachada
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rampas;