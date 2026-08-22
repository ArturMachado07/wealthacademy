import { Resend } from "resend";

// Envio de emails transaccionais (confirmação de inscrição, certificado
// emitido). Se RESEND_API_KEY não estiver definido, as funções abaixo não
// fazem nada (o site continua a funcionar normalmente, só sem emails) —
// mesmo padrão de degradação usada para Supabase/ProxyPay neste projecto.
// Ver .env.example e https://resend.com/docs/send-with-nextjs.

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "Wealth Academy <notificacoes@waca.ao>";

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
      html: `
        <p>Olá, ${params.name},</p>
        <p>A sua inscrição na formação <strong>${params.courseTitle}</strong> foi confirmada.</p>
        <p>Pode acompanhar o seu progresso na Área do Aluno, na Wealth Academy.</p>
        <p>Cumprimentos,<br/>Wealth Academy</p>
      `,
    });
  } catch (err) {
    console.error("[email] falha ao enviar confirmação de inscrição:", err);
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
      html: `
        <p>Olá, ${params.name},</p>
        <p>Parabéns pela conclusão da formação <strong>${params.courseTitle}</strong>.</p>
        <p>O seu certificado tem o número <strong>${params.certificateNumber}</strong> e pode ser
        validado publicamente em: <a href="${params.validateUrl}">${params.validateUrl}</a></p>
        <p>Cumprimentos,<br/>Wealth Academy</p>
      `,
    });
  } catch (err) {
    console.error("[email] falha ao enviar certificado:", err);
  }
}
