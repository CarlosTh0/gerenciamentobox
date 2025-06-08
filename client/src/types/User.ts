// src/types/User.ts
export type UserRole = 'admin' | 'operador' | 'visualizador';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Em produção, use hash!
  role: UserRole;
}
