// Copyright (c) 2025 Seu Nome ou Empresa
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/lib/auth";
import { User, UserRole } from "@/types/User";
import { v4 as uuidv4 } from "uuid";

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
	const [users, setUsers] = useState<User[]>(() => getUsers());
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editEmail, setEditEmail] = useState("");
	const [editPassword, setEditPassword] = useState("");
	const [editRole, setEditRole] = useState<UserRole>("visualizador");

	const handleRegister = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email || !password) {
			setError("Preencha todos os campos.");
			return;
		}
		const usersAtual = getUsers();
		if (usersAtual.some((u) => u.email === email)) {
			setError("E-mail já cadastrado.");
			return;
		}
		const newUser: User = {
			id: uuidv4(),
			name,
			email,
			password,
			role,
		};
		const updatedUsers = [...usersAtual, newUser];
		localStorage.setItem("users", JSON.stringify(updatedUsers));
		setUsers(updatedUsers); // Atualiza imediatamente
		setSuccess("Usuário cadastrado com sucesso!");
		setError("");
		setName("");
		setEmail("");
		setPassword("");
		setRole("visualizador");
	};

	const handleDelete = (id: string) => {
		if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
			const updated = users.filter((u) => u.id !== id);
			localStorage.setItem("users", JSON.stringify(updated));
			setUsers(updated);
			setSuccess("");
			setError("");
		}
	};

	const startEdit = (user: User) => {
		setEditingId(user.id);
		setEditName(user.name);
		setEditEmail(user.email);
		setEditPassword(user.password);
		setEditRole(user.role);
	};

	const handleEdit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!editName || !editEmail || !editPassword) {
			setError("Preencha todos os campos.");
			return;
		}
		if (users.some((u) => u.email === editEmail && u.id !== editingId)) {
			setError("E-mail já cadastrado.");
			return;
		}
		const updated = users.map((u) =>
			u.id === editingId
				? { ...u, name: editName, email: editEmail, password: editPassword, role: editRole }
				: u
		);
		localStorage.setItem("users", JSON.stringify(updated));
		setUsers(updated);
		setEditingId(null);
		setSuccess("Usuário atualizado!");
		setError("");
	};

	return (
		<div className="w-full max-w-md mx-auto flex flex-col gap-4">
			<div className="bg-card border rounded-xl shadow-lg p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
				<form onSubmit={handleRegister} className="flex flex-col gap-2 sm:gap-3">
					<Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
					<Input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
					<label className="font-medium">Perfil</label>
					<select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="border rounded px-2 py-1">
						{roles.map((r) => (
							<option key={r.value} value={r.value}>
								{r.label}
							</option>
						))}
					</select>
					{error && <span className="text-red-500 text-xs text-center">{error}</span>}
					{success && <span className="text-green-600 text-xs text-center">{success}</span>}
					<Button type="submit" className="w-full">Cadastrar</Button>
				</form>
			</div>
			<div className="bg-card border rounded-xl shadow p-3">
				<h3 className="font-semibold mb-2 text-center text-lg">Usuários cadastrados</h3>
				<div className="overflow-x-auto max-w-full">
					<table className="w-full min-w-[400px] text-sm border rounded bg-background">
						<thead>
							<tr className="bg-muted">
								<th className="p-2 text-left">Nome</th>
								<th className="p-2 text-left">E-mail</th>
								<th className="p-2 text-left">Permissão</th>
								<th className="p-2 text-left">Ações</th>
							</tr>
						</thead>
						<tbody>
							{users.map((u) =>
								editingId === u.id ? (
									<tr key={u.id} className="bg-muted/50">
										<td className="p-2">
											<Input value={editName} onChange={(e) => setEditName(e.target.value)} />
										</td>
										<td className="p-2">
											<Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
										</td>
										<td className="p-2">
											<select
												value={editRole}
												onChange={(e) => setEditRole(e.target.value as UserRole)}
												className="border rounded px-2 py-1"
											>
												{roles.map((r) => (
													<option key={r.value} value={r.value}>
														{r.label}
													</option>
												))}
											</select>
										</td>
										<td className="p-2 flex gap-2">
											<Input
												value={editPassword}
												onChange={(e) => setEditPassword(e.target.value)}
												type="password"
												className="w-24"
												placeholder="Senha"
											/>
											<Button size="sm" type="button" onClick={handleEdit}>
												Salvar
											</Button>
											<Button size="sm" type="button" variant="secondary" onClick={() => setEditingId(null)}>
												Cancelar
											</Button>
										</td>
									</tr>
								) : (
									<tr key={u.id}>
										<td className="p-2">{u.name}</td>
										<td className="p-2">{u.email}</td>
										<td className="p-2 capitalize">{roles.find(r => r.value === u.role)?.label || u.role}</td>
										<td className="p-2 flex gap-2">
											<Button size="sm" type="button" variant="outline" onClick={() => startEdit(u)}>
												Editar
											</Button>
											<Button size="sm" type="button" variant="destructive" onClick={() => handleDelete(u.id)}>
												Excluir
											</Button>
										</td>
									</tr>
								)
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
