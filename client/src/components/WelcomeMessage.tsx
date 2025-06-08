
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from 'lucide-react';

interface WelcomeMessageProps {
  userName?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ userName = "Usuário" }) => {
  return (
    <Card className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-background border-none shadow-xl">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4 pb-2">
        <div className="p-4 rounded-2xl bg-primary/10">
          <Truck className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            Bem-vindo, {userName}!
          </CardTitle>
          <CardDescription className="text-base">
            Sistema de Gerenciamento de Cegonheiras
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Gerencie suas cargas, acompanhe status e mantenha sua frota organizada em um só lugar.
        </p>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;
