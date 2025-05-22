import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { CargaItem } from "@/components/CargasTable";

interface FrotasFilaProps {
  cargas: CargaItem[];
  onSelectFrota?: (frota: string) => void;
}

const LOCAL_STORAGE_KEY = "fila-frotas";

export default function FrotasFila({ cargas, onSelectFrota }: FrotasFilaProps) {
  const [search, setSearch] = useState("");
  const [novaFrota, setNovaFrota] = useState("");
  const [fila, setFila] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Salva fila no localStorage sempre que mudar
  function saveFila(newFila: string[]) {
    setFila(newFila);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFila));
  }

  // Adiciona frota manualmente
  function handleAddFrota(e: React.FormEvent) {
    e.preventDefault();
    const frota = novaFrota.trim().toUpperCase();
    if (!frota || fila.includes(frota)) return;
    saveFila([...fila, frota]);
    setNovaFrota("");
  }

  // Remove frota da fila
  function handleRemoveFrota(frota: string) {
    saveFila(fila.filter(f => f !== frota));
  }

  // Busca e status de BOX-D
  const frotasFiltradas = useMemo(() => {
    let lista = fila;
    if (search) lista = lista.filter(f => f.toLowerCase().includes(search.toLowerCase()));
    return lista.map(frota => {
      const carga = cargas.find(c => c.FROTA === frota);
      return { frota, box: carga?.["BOX-D"] };
    });
  }, [fila, search, cargas]);

  return (
    <Card className="w-full max-w-xs flex flex-col gap-2 p-3 border shadow-sm">
      <form onSubmit={handleAddFrota} className="flex gap-2 mb-2">
        <Input
          placeholder="Adicionar frota..."
          value={novaFrota}
          onChange={e => setNovaFrota(e.target.value)}
          className="h-8 text-sm"
        />
        <button type="submit" className="bg-primary text-white rounded px-3 text-sm">Adicionar</button>
      </form>
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar na fila..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <ScrollArea className="h-80 pr-2">
        <div className="flex flex-col gap-2">
          {frotasFiltradas.length === 0 && (
            <span className="text-xs text-muted-foreground text-center">Nenhuma frota na fila</span>
          )}
          {frotasFiltradas.map(f => (
            <div key={f.frota} className="flex items-center gap-2 group">
              <button
                className="flex-1 text-left rounded hover:bg-muted/50 transition p-2 flex items-center gap-2"
                onClick={() => onSelectFrota?.(f.frota)}
                type="button"
              >
                <span className="font-mono font-semibold text-sm">{f.frota}</span>
                {f.box ? (
                  <Badge variant="outline" className="ml-2">BOX {String(f.box).padStart(2, "0")}</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">Aguardando</Badge>
                )}
              </button>
              <button
                className="text-destructive text-xs px-2 py-1 rounded hover:bg-destructive/10 hidden group-hover:block"
                title="Remover da fila"
                onClick={() => handleRemoveFrota(f.frota)}
                type="button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
