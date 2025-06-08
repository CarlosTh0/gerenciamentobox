import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, MapPin, Clock, Users, Activity, AlertTriangle, CheckCircle, XCircle, Wrench, Calendar, Timer, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Rampa {
  id: string;
  nome: string;
  codigo: string;
  tipo: "CARGA" | "DESCARGA" | "MIXTA";
  status: "LIVRE" | "OCUPADA" | "MANUTENCAO" | "INATIVA";
  capacidade: number;
  ocupacaoAtual: number;
  localizacao: string;
  responsavel?: string;
  observacoes?: string;
  ultimaAtualizacao: Date;
  proximaManutencao?: Date;
  tempoMedioOperacao?: number;
}

interface Agendamento {
  id: string;
  rampaId: string;
  dataHora: Date;
  duracao: number;
  tipo: "CARGA" | "DESCARGA";
  responsavel: string;
  observacoes?: string;
  status: "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
}

const LOCAL_STORAGE_KEY = 'rampas-data';
const LOCAL_STORAGE_AGENDAMENTOS_KEY = 'agendamentos-rampas-data';

export default function Rampas() {
  const [rampas, setRampas] = useState<Rampa[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filteredRampas, setFilteredRampas] = useState<Rampa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODAS");
  const [tipoFilter, setTipoFilter] = useState<string>("TODOS");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAgendamentoOpen, setIsAgendamentoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    tipo: "CARGA" as const,
    status: "LIVRE" as const,
    capacidade: 1,
    ocupacaoAtual: 0,
    localizacao: "",
    responsavel: "",
    observacoes: "",
    proximaManutencao: undefined as Date | undefined,
    tempoMedioOperacao: 30
  });

  const [agendamentoData, setAgendamentoData] = useState({
    rampaId: "",
    dataHora: new Date(),
    duracao: 60,
    tipo: "CARGA" as const,
    responsavel: "",
    observacoes: "",
    status: "AGENDADO" as const
  });

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedAgendamentos = localStorage.getItem(LOCAL_STORAGE_AGENDAMENTOS_KEY);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData).map((rampa: any) => ({
          ...rampa,
          ultimaAtualizacao: new Date(rampa.ultimaAtualizacao),
          proximaManutencao: rampa.proximaManutencao ? new Date(rampa.proximaManutencao) : undefined
        }));
        setRampas(parsedData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    if (storedAgendamentos) {
      try {
        const parsedAgendamentos = JSON.parse(storedAgendamentos).map((agendamento: any) => ({
          ...agendamento,
          dataHora: new Date(agendamento.dataHora)
        }));
        setAgendamentos(parsedAgendamentos);
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      }
    }
  }, []);

  useEffect(() => {
    let filtered = rampas;

    if (searchTerm) {
      filtered = filtered.filter(rampa =>
        rampa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rampa.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rampa.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rampa.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "TODAS") {
      filtered = filtered.filter(rampa => rampa.status === statusFilter);
    }

    if (tipoFilter !== "TODOS") {
      filtered = filtered.filter(rampa => rampa.tipo === tipoFilter);
    }

    setFilteredRampas(filtered);
  }, [rampas, searchTerm, statusFilter, tipoFilter]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rampas));
  }, [rampas]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_AGENDAMENTOS_KEY, JSON.stringify(agendamentos));
  }, [agendamentos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.codigo || !formData.localizacao) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setRampas(prev => prev.map(rampa => 
        rampa.id === editingId ? { 
          ...formData, 
          id: editingId,
          ultimaAtualizacao: new Date()
        } : rampa
      ));
      toast.success("Rampa atualizada com sucesso");
    } else {
      const novaRampa: Rampa = {
        ...formData,
        id: Date.now().toString(),
        ultimaAtualizacao: new Date()
      };
      setRampas(prev => [...prev, novaRampa]);
      toast.success("Rampa criada com sucesso");
    }

    resetForm();
  };

  const handleEdit = (rampa: Rampa) => {
    setFormData({
      nome: rampa.nome,
      codigo: rampa.codigo,
      tipo: rampa.tipo,
      status: rampa.status,
      capacidade: rampa.capacidade,
      ocupacaoAtual: rampa.ocupacaoAtual,
      localizacao: rampa.localizacao,
      responsavel: rampa.responsavel || "",
      observacoes: rampa.observacoes || "",
      proximaManutencao: rampa.proximaManutencao,
      tempoMedioOperacao: rampa.tempoMedioOperacao || 30
    });
    setEditingId(rampa.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setRampas(prev => prev.filter(rampa => rampa.id !== id));
    setAgendamentos(prev => prev.filter(agendamento => agendamento.rampaId !== id));
    toast.success("Rampa removida com sucesso");
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      tipo: "CARGA",
      status: "LIVRE",
      capacidade: 1,
      ocupacaoAtual: 0,
      localizacao: "",
      responsavel: "",
      observacoes: "",
      proximaManutencao: undefined,
      tempoMedioOperacao: 30
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agendamentoData.rampaId || !agendamentoData.responsavel) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const novoAgendamento: Agendamento = {
      ...agendamentoData,
      id: Date.now().toString()
    };

    setAgendamentos(prev => [...prev, novoAgendamento]);
    toast.success("Agendamento criado com sucesso");
    
    setAgendamentoData({
      rampaId: "",
      dataHora: new Date(),
      duracao: 60,
      tipo: "CARGA",
      responsavel: "",
      observacoes: "",
      status: "AGENDADO"
    });
    setIsAgendamentoOpen(false);
  };

  const updateRampaStatus = (rampaId: string, novoStatus: Rampa['status'], ocupacao?: number) => {
    setRampas(prev => prev.map(rampa => 
      rampa.id === rampaId ? { 
        ...rampa, 
        status: novoStatus,
        ocupacaoAtual: ocupacao !== undefined ? ocupacao : rampa.ocupacaoAtual,
        ultimaAtualizacao: new Date()
      } : rampa
    ));
  };

  const getStatusBadge = (status: Rampa['status']) => {
    const variants = {
      LIVRE: "default",
      OCUPADA: "destructive", 
      MANUTENCAO: "secondary",
      INATIVA: "outline"
    } as const;

    const icons = {
      LIVRE: <CheckCircle className="h-3 w-3" />,
      OCUPADA: <XCircle className="h-3 w-3" />,
      MANUTENCAO: <Wrench className="h-3 w-3" />,
      INATIVA: <AlertTriangle className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: Rampa['tipo']) => {
    const variants = {
      CARGA: "default",
      DESCARGA: "secondary",
      MIXTA: "outline"
    } as const;

    return (
      <Badge variant={variants[tipo]}>
        {tipo}
      </Badge>
    );
  };

  const stats = {
    total: rampas.length,
    livres: rampas.filter(r => r.status === "LIVRE").length,
    ocupadas: rampas.filter(r => r.status === "OCUPADA").length,
    manutencao: rampas.filter(r => r.status === "MANUTENCAO").length,
    inativas: rampas.filter(r => r.status === "INATIVA").length,
    capacidadeTotal: rampas.reduce((sum, r) => sum + r.capacidade, 0),
    ocupacaoTotal: rampas.reduce((sum, r) => sum + r.ocupacaoAtual, 0)
  };

  const getOcupacaoPercentage = (rampa: Rampa) => {
    return rampa.capacidade > 0 ? (rampa.ocupacaoAtual / rampa.capacidade) * 100 : 0;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Controle de Rampas</h1>
          <p className="text-muted-foreground">Gerenciar operações de carga e descarga</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAgendamentoOpen} onOpenChange={setIsAgendamentoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
                <DialogDescription>
                  Agende uma operação de carga ou descarga
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAgendamento} className="space-y-4">
                <div>
                  <Label htmlFor="rampa-select">Rampa *</Label>
                  <Select 
                    value={agendamentoData.rampaId} 
                    onValueChange={(value) => setAgendamentoData(prev => ({ ...prev, rampaId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma rampa" />
                    </SelectTrigger>
                    <SelectContent>
                      {rampas.filter(r => r.status === "LIVRE").map((rampa) => (
                        <SelectItem key={rampa.id} value={rampa.id}>
                          {rampa.nome} - {rampa.codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data-hora">Data/Hora *</Label>
                    <Input
                      id="data-hora"
                      type="datetime-local"
                      value={format(agendamentoData.dataHora, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setAgendamentoData(prev => ({ 
                        ...prev, 
                        dataHora: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duracao">Duração (min)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      min="15"
                      value={agendamentoData.duracao}
                      onChange={(e) => setAgendamentoData(prev => ({ 
                        ...prev, 
                        duracao: parseInt(e.target.value) || 60 
                      }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select 
                      value={agendamentoData.tipo} 
                      onValueChange={(value: "CARGA" | "DESCARGA") => 
                        setAgendamentoData(prev => ({ ...prev, tipo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARGA">Carga</SelectItem>
                        <SelectItem value="DESCARGA">Descarga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Responsável *</Label>
                    <Input
                      id="responsavel"
                      value={agendamentoData.responsavel}
                      onChange={(e) => setAgendamentoData(prev => ({ 
                        ...prev, 
                        responsavel: e.target.value 
                      }))}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes-agendamento">Observações</Label>
                  <Textarea
                    id="observacoes-agendamento"
                    value={agendamentoData.observacoes}
                    onChange={(e) => setAgendamentoData(prev => ({ 
                      ...prev, 
                      observacoes: e.target.value 
                    }))}
                    placeholder="Informações adicionais..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAgendamentoOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Agendar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Nova Rampa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Livres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.livres}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              Ocupadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.ocupadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Wrench className="h-4 w-4 text-orange-600" />
              Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.manutencao}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4" />
              Capacidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.capacidadeTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Package className="h-4 w-4" />
              Em Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ocupacaoTotal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, código, localização ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  <SelectItem value="LIVRE">Livres</SelectItem>
                  <SelectItem value="OCUPADA">Ocupadas</SelectItem>
                  <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                  <SelectItem value="INATIVA">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <Label htmlFor="tipo-filter">Tipo</Label>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="CARGA">Carga</SelectItem>
                  <SelectItem value="DESCARGA">Descarga</SelectItem>
                  <SelectItem value="MIXTA">Mista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-32">
              <Label>Visualização</Label>
              <Select value={viewMode} onValueChange={(value: "cards" | "table") => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">Cards</SelectItem>
                  <SelectItem value="table">Tabela</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Rampa" : "Nova Rampa"}</CardTitle>
            <CardDescription>
              {editingId ? "Atualize as informações da rampa" : "Adicione uma nova rampa ao sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Rampa A1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Ex: RA01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value: Rampa['tipo']) => setFormData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CARGA">Carga</SelectItem>
                      <SelectItem value="DESCARGA">Descarga</SelectItem>
                      <SelectItem value="MIXTA">Mista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localizacao">Localização *</Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                    placeholder="Ex: Setor Norte, Área 1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    min="1"
                    value={formData.capacidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ocupacao">Ocupação Atual</Label>
                  <Input
                    id="ocupacao"
                    type="number"
                    min="0"
                    max={formData.capacidade}
                    value={formData.ocupacaoAtual}
                    onChange={(e) => setFormData(prev => ({ ...prev, ocupacaoAtual: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tempo-medio">Tempo Médio (min)</Label>
                  <Input
                    id="tempo-medio"
                    type="number"
                    min="5"
                    value={formData.tempoMedioOperacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempoMedioOperacao: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: Rampa['status']) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIVRE">Livre</SelectItem>
                      <SelectItem value="OCUPADA">Ocupada</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="INATIVA">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="proxima-manutencao">Próxima Manutenção</Label>
                  <Input
                    id="proxima-manutencao"
                    type="date"
                    value={formData.proximaManutencao ? format(formData.proximaManutencao, "yyyy-MM-dd") : ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      proximaManutencao: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"} Rampa
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rampas List */}
      <Card>
        <CardHeader>
          <CardTitle>Rampas Cadastradas ({filteredRampas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRampas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4" />
              <p>Nenhuma rampa encontrada</p>
              {rampas.length === 0 && (
                <p className="text-sm">Clique em "Nova Rampa" para começar</p>
              )}
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRampas.map((rampa) => (
                <Card key={rampa.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {rampa.nome}
                          {getTipoBadge(rampa.tipo)}
                        </CardTitle>
                        <CardDescription>Código: {rampa.codigo}</CardDescription>
                      </div>
                      {getStatusBadge(rampa.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{rampa.localizacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span><strong>Capacidade:</strong> {rampa.ocupacaoAtual}/{rampa.capacidade}</span>
                        <span className="text-xs text-muted-foreground">
                          {getOcupacaoPercentage(rampa).toFixed(0)}%
                        </span>
                      </div>
                      {rampa.responsavel && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{rampa.responsavel}</span>
                        </div>
                      )}
                      {rampa.tempoMedioOperacao && (
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span>{rampa.tempoMedioOperacao} min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                          Atualizado: {format(rampa.ultimaAtualizacao, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      {rampa.observacoes && (
                        <div>
                          <strong>Observações:</strong> {rampa.observacoes}
                        </div>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(rampa)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a rampa "{rampa.nome}"? 
                              Esta ação não pode ser desfeita e todos os agendamentos relacionados serão removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(rampa.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {rampa.status === "LIVRE" && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => updateRampaStatus(rampa.id, "OCUPADA", rampa.ocupacaoAtual + 1)}
                          className="flex items-center gap-1"
                        >
                          <Package className="h-3 w-3" />
                          Ocupar
                        </Button>
                      )}
                      {rampa.status === "OCUPADA" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateRampaStatus(rampa.id, "LIVRE", Math.max(0, rampa.ocupacaoAtual - 1))}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Liberar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome/Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ocupação</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRampas.map((rampa) => (
                  <TableRow key={rampa.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rampa.nome}</div>
                        <div className="text-sm text-muted-foreground">{rampa.codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTipoBadge(rampa.tipo)}</TableCell>
                    <TableCell>{getStatusBadge(rampa.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{rampa.ocupacaoAtual}/{rampa.capacidade}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${getOcupacaoPercentage(rampa)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{rampa.localizacao}</TableCell>
                    <TableCell>{rampa.responsavel || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(rampa)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a rampa "{rampa.nome}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(rampa.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}