
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandshakeIcon } from 'lucide-react';

interface WelcomeMessageProps {
  userName?: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ userName = "Usuário" }) => {
  return (
    <Card className="max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <HandshakeIcon className="w-10 h-10 text-primary" />
        <div>
          <CardTitle>Bem-vindo, {userName}!</CardTitle>
          <CardDescription>Seu sistema de gerenciamento de cargas está pronto.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Aqui você pode gerenciar suas cargas, verificar status e manter tudo organizado.
        </p>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;
