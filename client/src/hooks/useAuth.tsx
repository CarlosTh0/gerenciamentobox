import { useState } from "react";
import { login, getCurrentUser, logout } from "@/lib/auth";
import { User } from "@/types/User";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (email: string, password: string) => {
    const logged = login(email, password);
    if (logged) {
      setUser(logged);
      setError(null);
    } else {
      setError("Usuário ou senha inválidos");
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return { user, error, login: handleLogin, logout: handleLogout };
}
