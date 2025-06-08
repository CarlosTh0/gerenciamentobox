import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Rampa {
  id: string;
  nome: string;
  codigo: string;
  localizacao: string;
  status: "ATIVA" | "INATIVA" | "MANUTENCAO";
  capacidade: number;
  observacoes?: string;
}

const LOCAL_STORAGE_KEY = 'rampas-data';

export default function Rampas() {
  const [rampas, setRampas] = useState<Rampa[]>([]);
  const [filteredRampas, setFilteredRampas] = useState<Rampa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODAS");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Rampa, 'id'>>({
    nome: "",
    codigo: "",
    localizacao: "",
    status: "ATIVA",
    capacidade: 1,
    observacoes: ""
  });

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setRampas(parsedData);
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    let filtered = rampas;

    if (searchTerm) {
      filtered = filtered.filter(rampa =>
        rampa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rampa.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rampa.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "TODAS") {
      filtered = filtered.filter(rampa => rampa.status === statusFilter);
    }

    setFilteredRampas(filtered);
  }, [rampas, searchTerm, statusFilter]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rampas));
  }, [rampas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.codigo || !formData.localizacao) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setRampas(prev => prev.map(rampa => 
        rampa.id === editingId ? { ...formData, id: editingId } : rampa
      ));
      toast.success("Rampa atualizada com sucesso");
    } else {
      const novaRampa: Rampa = {
        ...formData,
        id: Date.now().toString()
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
      localizacao: rampa.localizacao,
      status: rampa.status,
      capacidade: rampa.capacidade,
      observacoes: rampa.observacoes || ""
    });
    setEditingId(rampa.id);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setRampas(prev => prev.filter(rampa => rampa.id !== id));
    toast.success("Rampa removida com sucesso");
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      codigo: "",
      localizacao: "",
      status: "ATIVA",
      capacidade: 1,
      observacoes: ""
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const getStatusBadge = (status: Rampa['status']) => {
    const variants = {
      ATIVA: "default",
      INATIVA: "secondary",
      MANUTENCAO: "destructive"
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    );
  };

  const stats = {
    total: rampas.length,
    ativas: rampas.filter(r => r.status === "ATIVA").length,
    inativas: rampas.filter(r => r.status === "INATIVA").length,
    manutencao: rampas.filter(r => r.status === "MANUTENCAO").length
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Rampas</h1>
          <p className="text-muted-foreground">Controle e monitore as rampas de carga</p>
        </div>
        <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Nova Rampa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inativas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.manutencao}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, código ou localização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  <SelectItem value="ATIVA">Ativas</SelectItem>
                  <SelectItem value="INATIVA">Inativas</SelectItem>
                  <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    min="1"
                    value={formData.capacidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 1 }))}
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
                      <SelectItem value="ATIVA">Ativa</SelectItem>
                      <SelectItem value="INATIVA">Inativa</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais..."
                  />
                </div>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRampas.map((rampa) => (
                <Card key={rampa.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{rampa.nome}</CardTitle>
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
                      <div>
                        <strong>Capacidade:</strong> {rampa.capacidade}
                      </div>
                      {rampa.observacoes && (
                        <div>
                          <strong>Observações:</strong> {rampa.observacoes}
                        </div>
                      )}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(rampa)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(rampa.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}