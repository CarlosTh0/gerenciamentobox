import { User, UserRole } from "@/types/User";
import { v4 as uuidv4 } from "uuid";

// Usuários de exemplo (em produção, use backend!)
const defaultUsers: User[] = [
  {
    id: uuidv4(),
    name: "Administrador",
    email: "admin@demo.com",
    password: "admin123", // Em produção, use hash!
    role: "admin",
  },
  {
    id: uuidv4(),
    name: "Operador",
    email: "operador@demo.com",
    password: "operador123",
    role: "operador",
  },
  {
    id: uuidv4(),
    name: "Visualizador",
    email: "visualizador@demo.com",
    password: "visual123",
    role: "visualizador",
  },
];

export function getUsers(): User[] {
  const users = localStorage.getItem("users");
  if (users) return JSON.parse(users);
  localStorage.setItem("users", JSON.stringify(defaultUsers));
  return defaultUsers;
}

export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem("currentUser");
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export function hasPermission(role: UserRole, action: "view" | "edit" | "delete"): boolean {
  if (role === "admin") return true;
  if (role === "operador") return action !== "delete";
  if (role === "visualizador") return action === "view";
  return false;
}
