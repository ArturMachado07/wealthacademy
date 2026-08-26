// Gera um código de convite curto (6 caracteres, maiúsculas + dígitos, sem
// caracteres ambíguos como 0/O ou 1/I) para o link de entrada numa turma —
// ver /aluno/turma/[code].
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
