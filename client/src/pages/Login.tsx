import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { user, error, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Bem-vindo, {user.name}!</h2>
        <p className="mb-2">Você está logado como <b>{user.role}</b>.</p>
        <Button onClick={() => window.location.href = "/"}>Ir para o sistema</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm border">
        <h2 className="text-xl font-bold mb-6">Login</h2>
        <form onSubmit={e => { e.preventDefault(); login(email, password); }} className="space-y-4">
          <Input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
        {/* Bloco de usuários removido para segurança */}
      </div>
    </div>
  );
}
