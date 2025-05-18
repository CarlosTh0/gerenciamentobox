import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/lib/auth";
import { User, UserRole } from "@/types/User";

const roles: { label: string; value: UserRole }[] = [
  { label: "Administrador", value: "admin" },
  { label: "Operador", value: "operador" },
  { label: "Visualizador", value: "visualizador" },
];

export default function UserRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("visualizador");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      setError("E-mail já cadastrado.");
      return;
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role,
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setSuccess("Usuário cadastrado com sucesso!");
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("visualizador");
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-2 p-4 border rounded-lg bg-card mb-4 max-w-md">
      <h2 className="font-bold text-lg mb-2">Cadastrar Novo Usuário</h2>
      <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
      <Input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <label className="font-medium">Perfil</label>
      <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="border rounded px-2 py-1">
        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      {error && <span className="text-red-500 text-xs">{error}</span>}
      {success && <span className="text-green-600 text-xs">{success}</span>}
      <Button type="submit">Cadastrar</Button>
    </form>
  );
}
