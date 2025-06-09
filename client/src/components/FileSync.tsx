import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Download, Upload } from "lucide-react";

interface FileSyncProps {
  onImport: (data: any[]) => void;
}

export default function FileSync({ onImport }: FileSyncProps) {
  const [ftpUrl, setFtpUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFtpSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ftp-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ftpUrl })
      });
      
      if (!response.ok) throw new Error("Erro ao sincronizar arquivos");
      
      const data = await response.json();
      onImport(data);
      toast.success(`Arquivo sincronizado: ${data.length} registros`);
    } catch (error) {
      toast.error("Erro na sincronização: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebhookSetup = () => {
    const webhookUrl = `${window.location.origin}/api/webhook/cargas`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL do webhook copiada! Configure no sistema externo.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincronização de Arquivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">URL do Servidor FTP/SFTP</label>
          <Input 
            value={ftpUrl}
            onChange={(e) => setFtpUrl(e.target.value)}
            placeholder="ftp://servidor.com/pasta/arquivo.csv"
          />
          <Button 
            onClick={handleFtpSync} 
            disabled={loading || !ftpUrl}
            className="mt-2 w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Sincronizando..." : "Baixar e Importar"}
          </Button>
        </div>
        
        <div className="border-t pt-4">
          <label className="text-sm font-medium">Webhook para Receber Dados</label>
          <p className="text-xs text-muted-foreground mb-2">
            Configure o sistema externo para enviar dados automaticamente
          </p>
          <Button 
            onClick={handleWebhookSetup}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Copiar URL do Webhook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}