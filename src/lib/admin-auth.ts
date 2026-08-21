// Camada de autenticação do Admin/CRM — arquitectura preparada, sem
// implementação funcional nesta fase. Vai precisar de autenticação própria
// (mais forte do que o gate de staging), com papéis/permissões — ex.
// NextAuth.js + tabela de utilizadores administrativos, ou um provedor
// dedicado (Clerk/Auth0) com RBAC (director, gestor de formações, etc.).

export type AdminUser = {
  id: string;
  name: string;
  role: "Director" | "Gestor de Formações" | "Gestor de Leads";
};

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  return null;
}
