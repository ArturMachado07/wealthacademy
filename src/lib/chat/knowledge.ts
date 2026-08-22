import { courses } from "@/data/courses";
import { siteConfig } from "@/data/site";
import { getCourseOverrides, applyCourseOverride } from "@/lib/course-overrides";

// Constrói o "conhecimento" que passamos ao assistente de IA no prompt de
// sistema — só dados reais do site (catálogo + contactos), nunca inventados.
// Isto é o que impede o assistente de "alucinar" preços/datas: só puxamos o
// que já está no catálogo (com os overrides do Admin aplicados) ou nos
// contactos oficiais.
export async function buildKnowledgeContext(): Promise<string> {
  const overrides = await getCourseOverrides();

  const courseLines = courses.map((course) => {
    const priced = applyCourseOverride(course, overrides.get(course.slug));
    const parts = [
      `- ${priced.title} (categoria: ${priced.category}, estado: ${priced.status})`,
      priced.investment ? `  Investimento: ${priced.investment}` : `  Investimento: por confirmar`,
      priced.date ? `  Data: ${priced.date}` : null,
      priced.modality ? `  Modalidade: ${priced.modality}` : null,
      priced.duration ? `  Duração: ${priced.duration}` : null,
      priced.description ? `  Resumo: ${priced.description}` : null,
    ].filter(Boolean);
    return parts.join("\n");
  });

  return [
    `Formações disponíveis na Wealth Academy:`,
    courseLines.join("\n\n"),
    ``,
    `Contactos oficiais:`,
    `- Telefone/WhatsApp: ${siteConfig.phone}`,
    `- Email: ${siteConfig.emails.geral}`,
    `- Morada: ${siteConfig.address}`,
    `- Instagram: ${siteConfig.social.instagram}`,
    `- LinkedIn: ${siteConfig.social.linkedin}`,
  ].join("\n");
}

export const CHAT_SYSTEM_PROMPT_HEADER = `És o assistente virtual da Wealth Academy, uma academia de formação em Finanças e Negócios em Angola (licenciada pelo INEFOP, registo 1140.01/LDA./2024, marca da The Finance Boutique — Wealth Management & Advisory Services, Lda).

Regras importantes:
1. Responde só com base na informação fornecida abaixo (catálogo de formações e contactos). Nunca inventes preços, datas, horários ou políticas que não estejam aqui — se não souberes, diz que vais confirmar com a equipa e sugere falar via WhatsApp.
2. Não dás aconselhamento financeiro pessoal (não digas a ninguém em que investir o dinheiro deles) — só descreves o conteúdo e objectivos das formações.
3. Para assuntos de conta, inscrição já feita, pagamentos ou reclamações, encaminha sempre para o WhatsApp humano em vez de tentar resolver.
4. Tom: caloroso, profissional, directo. Respostas curtas (2-4 frases), em português de Angola. Sem markdown, sem listas com asteriscos — texto corrido.
5. Se a pergunta não tiver nada a ver com a Wealth Academy, respondes com simpatia que só ajudas com assuntos da Wealth Academy.

Informação disponível:`;
