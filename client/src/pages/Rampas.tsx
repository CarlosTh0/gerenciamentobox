import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, Filter, Package, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import RampaCard from '@/components/RampaCard';
import { CargaItem } from '@/components/CargasTable';
import { getCargas } from '@/lib/api';

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
  
  const [cargasGerenciamento, setCargasGerenciamento] = useState<CargaItem[]>([]);
  const [rampasBloqueadas, setRampasBloqueadas] = useState<RampaBloqueada[]>([]);
  const [novaFrota, setNovaFrota] = useState('');
  const [filtroDespachadas, setFiltroDespachadas] = useState('');

  // Carrega dados do Gerenciamento do backend
  useEffect(() => {
    getCargas().then(setCargasGerenciamento).catch(() => toast.error('Erro ao carregar cargas do servidor'));
  }, []);

  // Função para buscar BOX-D de uma frota no Gerenciamento
  const obterBoxDDaFrota = (numeroFrota: string): string[] => {
    return cargasGerenciamento
      .filter(carga => carga.FROTA === numeroFrota)
      .map(carga => carga["BOX-D"])
      .filter(box => box && box.trim() !== '');
  };

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

  const apagarFrota = (frotaId: string) => {
    const frota = frotas.find(f => f.id === frotaId);
    setFrotas(prev => prev.filter(f => f.id !== frotaId));
    toast.success(`${frota?.numero} foi removida do sistema`);
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
            <svg className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 18 L8 12 L22 12 L22 18 Z" stroke="currentColor" strokeWidth="1" fill="currentColor"/>
              <path d="M8 12 L16 18" stroke="white" strokeWidth="1.5"/>
              <rect x="16" y="15" width="3" height="3" fill="white"/>
            </svg>
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
                <div className={`space-y-4 md:space-y-6 ${totalVaos >= 5 ? 'max-h-[600px] overflow-y-auto pr-2' : ''}`}>
                  {Array.from({ length: totalVaos }, (_, vaoIndex) => (
                    <div key={vaoIndex + 1} className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-700 border-b pb-2 sticky top-0 bg-white z-10">
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
                              cargasGerenciamento={cargasGerenciamento}
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
                        onChange={e => {
                          const value = Math.max(1, Number(e.target.value));
                          setTotalVaos(value);
                          updateConfig(value, rampasPorVao);
                        }}
                        className="h-7 w-20 text-center"
                        min={1}
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
                            toast.success(`Agora temos ${rampasPorVao - 1} rampas por vão`);
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
                        onChange={e => {
                          const value = Math.max(1, Number(e.target.value));
                          setRampasPorVao(value);
                          updateConfig(totalVaos, value);
                        }}
                        className="h-7 w-20 text-center"
                        min={1}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateConfig(totalVaos, rampasPorVao + 1);
                          toast.success(`Agora temos ${rampasPorVao + 1} rampas por vão`);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-500 mt-2">
                  Dica: Use o filtro abaixo para encontrar frotas despachadas mais rapidamente.
                </div>
              </CardContent>
            </Card>

            {/* Filtro de Frotas Despachadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Filtro de Frotas Despachadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Digite o número da frota"
                    value={filtroDespachadas}
                    onChange={e => setFiltroDespachadas(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      if (filtroDespachadas.trim()) {
                        toast.success(`Filtrando frotas despachadas por "${filtroDespachadas}"`);
                      } else {
                        toast.success("Removendo filtro de frotas despachadas");
                      }
                    }}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ações em Massa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Ações em Massa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const frotasSelecionadas = frotas.filter(f => f.status === 'rampa' && f.carregada === false);
                      if (frotasSelecionadas.length === 0) {
                        toast.error("Nenhuma frota disponível para descarregamento");
                        return;
                      }
                      frotasSelecionadas.forEach(frota => {
                        finalizarCarregamento(frota.id);
                      });
                      toast.success(`Descarregadas ${frotasSelecionadas.length} frotas com sucesso`);
                    }}
                    className="flex-1"
                  >
                    Descarregar Frotas
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      const frotasSelecionadas = frotas.filter(f => f.status === 'rampa' && f.carregada === true);
                      if (frotasSelecionadas.length === 0) {
                        toast.error("Nenhuma frota carregada selecionada");
                        return;
                      }
                      frotasSelecionadas.forEach(frota => {
                        removerFrota(frota.id);
                      });
                      toast.success(`Removidas ${frotasSelecionadas.length} frotas do sistema`);
                    }}
                    className="flex-1"
                  >
                    Remover Frotas Carregadas
                  </Button>
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
                    placeholder="Número da nova frota"
                    value={novaFrota}
                    onChange={e => setNovaFrota(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    onClick={adicionarFrota}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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
