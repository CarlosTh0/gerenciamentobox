import type { User } from "../../client/src/types/User";

export function getCurrentUser(): User | null {
  const user = localStorage.getItem("currentUser");
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    // Valor inválido, remove e retorna null
    localStorage.removeItem("currentUser");
    return null;
  }
}