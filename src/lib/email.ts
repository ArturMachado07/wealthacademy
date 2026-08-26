import { Resend } from "resend";
import { siteConfig } from "@/data/site";

// Envio de emails transaccionais (confirmação de inscrição, certificado
// emitido). Se RESEND_API_KEY não estiver definido, as funções abaixo não
// fazem nada (o site continua a funcionar normalmente, só sem emails) —
// mesmo padrão de degradação usada para Supabase/ProxyPay neste projecto.
// Ver .env.example e https://resend.com/docs/send-with-nextjs.
//
// O template visual (logo, cores, rodapé) espelha
// supabase/email-templates/*.html, usados para os emails do próprio
// Supabase Auth — mantém a mesma marca em todos os emails do site.

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "Wealth Academy <notificacoes@waca.ao>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wealthacademy-ten.vercel.app";
const LOGO_URL = `${SITE_URL}/brand/logo-email.png`;

function renderEmailShell(params: {
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F6EA;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:32px 32px 16px 32px;">
              <img src="${LOGO_URL}" width="160" alt="Wealth Academy" style="display:block;" />
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 32px 40px;font-family:Arial,Helvetica,sans-serif;color:#352C29;">
              <h1 style="font-size:20px;margin:0 0 16px 0;color:#352C29;">${params.heading}</h1>
              ${params.bodyHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                <tr>
                  <td style="border-radius:2px;background-color:#9D743A;">
                    <a href="${params.ctaUrl}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#F8F6EA;text-decoration:none;">${params.ctaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#57493F;">
              © 2026 Wealth Academy — uma marca de The Finance Boutique, Wealth Management &amp;
              Advisory Services, Lda.<br />
              Registo INEFOP 1140.01/LDA./2024 · Luanda, Angola
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}

export async function sendEnrollmentConfirmationEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `Inscrição confirmada — ${params.courseTitle}`,
      html: renderEmailShell({
        heading: "Inscrição confirmada",
        bodyHtml: `
          <p style="font-size:14px;line-height:1.6;margin:0 0 16px 0;color:#57493F;">Olá, ${params.name},</p>
          <p style="font-size:14px;line-height:1.6;margin:0 0 24px 0;color:#57493F;">
            A sua inscrição na formação <strong>${params.courseTitle}</strong> foi confirmada.
            Já pode acompanhar o seu progresso e aceder ao conteúdo na Área do Aluno.
          </p>
        `,
        ctaLabel: "Aceder à Área do Aluno",
        ctaUrl: `${SITE_URL}/aluno`,
      }),
    });
  } catch (err) {
    console.error("[email] falha ao enviar confirmação de inscrição:", err);
  }
}

// Avisa a equipa (email geral da Wealth Academy) sempre que chega um lead
// novo — antes disto, um lead só era visto se alguém fosse manualmente ao
// painel Admin conferir (auditoria de pré-lançamento).
// Alerta de erro em produção — substituto sem dependências para uma
// ferramenta como o Sentry (auditoria de pré-lançamento, Fase 3). Chamado
// via src/lib/error-alert.ts, nunca directamente, para já ter o
// throttling aplicado (evita encher a caixa de correio se o mesmo erro
// repetir várias vezes seguidas).
export async function sendErrorAlertEmail(params: { context: string; message: string; detail?: string }) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: siteConfig.emails.geral,
      subject: `⚠ Erro em produção — ${params.context}`,
      html: renderEmailShell({
        heading: "Erro em produção",
        bodyHtml: `
          <p style="font-size:14px;line-height:1.6;margin:0 0 12px 0;color:#57493F;">
            Local: <strong>${params.context}</strong>
          </p>
          <p style="font-size:14px;line-height:1.6;margin:0 0 12px 0;color:#57493F;">
            ${params.message}
          </p>
          ${
            params.detail
              ? `<pre style="font-size:12px;line-height:1.5;background:#F1EFE1;padding:12px;border-radius:4px;overflow-x:auto;color:#57493F;">${escapeHtml(params.detail)}</pre>`
              : ""
          }
        `,
        ctaLabel: "Ver painel Admin",
        ctaUrl: `${SITE_URL}/admin`,
      }),
    });
  } catch (err) {
    console.error("[email] falha ao enviar alerta de erro (isto não deve bloquear nada):", err);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export async function sendNewLeadNotificationEmail(params: {
  name: string;
  email: string;
  phone: string;
  interest?: string | null;
  origin?: string | null;
  company?: string | null;
  role?: string | null;
  participants?: string | null;
  trainingNeed?: string | null;
  preferredModality?: string | null;
  message?: string | null;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const to = siteConfig.emails.geral;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Novo lead — ${params.name}`,
      html: renderEmailShell({
        heading: "Novo pedido de contacto",
        bodyHtml: `
          <p style="font-size:14px;line-height:1.6;margin:0 0 16px 0;color:#57493F;">
            Chegou um novo pedido pelo site:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.8;color:#57493F;">
            <tr><td style="font-weight:600;">Nome</td><td>${params.name}</td></tr>
            <tr><td style="font-weight:600;">Email</td><td>${params.email}</td></tr>
            <tr><td style="font-weight:600;">Telefone</td><td>${params.phone}</td></tr>
            ${params.interest ? `<tr><td style="font-weight:600;">Interesse</td><td>${params.interest}</td></tr>` : ""}
            ${params.company ? `<tr><td style="font-weight:600;">Empresa</td><td>${params.company}</td></tr>` : ""}
            ${params.role ? `<tr><td style="font-weight:600;">Cargo</td><td>${params.role}</td></tr>` : ""}
            ${params.participants ? `<tr><td style="font-weight:600;">Participantes</td><td>${params.participants}</td></tr>` : ""}
            ${params.trainingNeed ? `<tr><td style="font-weight:600;">Necessidade de formação</td><td>${params.trainingNeed}</td></tr>` : ""}
            ${params.preferredModality ? `<tr><td style="font-weight:600;">Modalidade preferencial</td><td>${params.preferredModality}</td></tr>` : ""}
            ${params.origin ? `<tr><td style="font-weight:600;">Origem</td><td>${params.origin}</td></tr>` : ""}
            ${params.message ? `<tr><td style="font-weight:600;">Mensagem</td><td>${params.message}</td></tr>` : ""}
          </table>
        `,
        ctaLabel: "Ver todos os leads",
        ctaUrl: `${SITE_URL}/admin`,
      }),
    });
  } catch (err) {
    console.error("[email] falha ao enviar notificação de novo lead:", err);
  }
}

export async function sendCertificateEmail(params: {
  to: string;
  name: string;
  courseTitle: string;
  certificateNumber: string;
  validateUrl: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `O seu certificado — ${params.courseTitle}`,
      html: renderEmailShell({
        heading: "Parabéns pela conclusão",
        bodyHtml: `
          <p style="font-size:14px;line-height:1.6;margin:0 0 16px 0;color:#57493F;">Olá, ${params.name},</p>
          <p style="font-size:14px;line-height:1.6;margin:0 0 12px 0;color:#57493F;">
            Concluiu com sucesso a formação <strong>${params.courseTitle}</strong>.
          </p>
          <p style="font-size:14px;line-height:1.6;margin:0 0 24px 0;color:#57493F;">
            O seu certificado tem o número <strong>${params.certificateNumber}</strong> e pode ser
            validado publicamente a qualquer momento.
          </p>
        `,
        ctaLabel: "Validar certificado",
        ctaUrl: params.validateUrl,
      }),
    });
  } catch (err) {
    console.error("[email] falha ao enviar certificado:", err);
  }
}
