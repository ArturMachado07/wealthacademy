// Camada de autenticação — arquitectura preparada, sem implementação funcional
// nesta fase (conforme briefing: "não implementar a Área do Aluno agora").
//
// Quando esta fase avançar, substituir por uma integração real
// (ex. NextAuth.js, Clerk ou Supabase Auth) mantendo esta mesma assinatura,
// para que app/area-do-aluno/** passe a funcionar sem alterações estruturais.

export type Student = {
  id: string;
  name: string;
  email: string;
};

export async function getCurrentStudent(): Promise<Student | null> {
  return null;
}
