import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Wealth Academy recolhe, usa e protege os seus dados pessoais.",
};

export default function PrivacidadePage() {
  return (
    <section className="py-24">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Legal" title="Política de Privacidade" />

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft">
          <p className="text-xs text-ink-soft/70">
            Última actualização: {new Date().toLocaleDateString("pt-PT")}. Este documento é um ponto de partida —
            recomenda-se revisão por um jurista antes de ser tratado como definitivo.
          </p>

          <div>
            <h2 className="text-base font-medium text-ink">1. Quem somos</h2>
            <p className="mt-2">
              A Wealth Academy é uma marca de The Finance Boutique, Wealth Management &amp; Advisory Services, Lda.
              (registo INEFOP 1140.01/LDA./2024), com sede em {siteConfig.address}. Para qualquer questão sobre esta
              política ou sobre os seus dados pessoais, contacte-nos em{" "}
              <a href={`mailto:${siteConfig.emails.geral}`} className="text-gold-dark underline">
                {siteConfig.emails.geral}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">2. Que dados recolhemos</h2>
            <p className="mt-2">Recolhemos dados pessoais quando o utilizador interage voluntariamente com o site:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Formulários de contacto e de interesse em formações: nome, email, telefone e, quando aplicável, empresa.</li>
              <li>Registo como aluno: nome, email, telefone (opcional), fotografia de perfil (opcional).</li>
              <li>Inscrição e pagamento de formações: dados da inscrição, estado do pagamento e, quando emitida pela Wealth Academy, a factura correspondente.</li>
              <li>Utilização da plataforma: progresso nas formações, resultados de testes, certificados emitidos.</li>
              <li>Comunicação com o assistente virtual do site (quando activo), para responder às perguntas colocadas.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">3. Para que usamos os dados</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Processar inscrições, pagamentos e emitir certificados.</li>
              <li>Responder a pedidos de informação e contacto comercial.</li>
              <li>Enviar comunicações relacionadas com a conta e as formações do aluno (confirmações, certificados, redefinição de password).</li>
              <li>Medir a utilização do site para o melhorar, quando ferramentas de analytics estiverem activas (ver secção 5).</li>
            </ul>
            <p className="mt-3">
              Não vendemos nem partilhamos os seus dados pessoais com terceiros para fins de marketing próprio deles.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">4. Pagamentos</h2>
            <p className="mt-2">
              Os pagamentos são processados através do Multicaixa Express (via ProxyPay/EMIS GPO). A Wealth Academy
              não armazena dados de cartão ou de conta bancária — esse processamento é feito directamente pelo
              prestador de serviços de pagamento.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">5. Cookies e analytics</h2>
            <p className="mt-2">
              O site pode usar ferramentas como o Google Analytics para perceber como é utilizado, e a Meta Pixel
              para medir a eficácia de campanhas publicitárias, quando estas estiverem activas. Estas ferramentas
              podem definir cookies no seu browser. Pode gerir ou bloquear cookies nas definições do seu browser a
              qualquer momento.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">6. Com quem partilhamos dados</h2>
            <p className="mt-2">Usamos os seguintes prestadores de serviços para operar a plataforma, cada um com acesso apenas aos dados estritamente necessários à função que desempenha:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Supabase — alojamento da base de dados e autenticação de contas.</li>
              <li>Resend — envio de emails transaccionais (confirmações, certificados, recuperação de password).</li>
              <li>ProxyPay/EMIS — processamento de pagamentos via Multicaixa Express.</li>
              <li>Vercel — alojamento do site.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">7. Os seus direitos</h2>
            <p className="mt-2">
              Pode, a qualquer momento, pedir para aceder, corrigir ou eliminar os seus dados pessoais, contactando-nos
              em{" "}
              <a href={`mailto:${siteConfig.emails.geral}`} className="text-gold-dark underline">
                {siteConfig.emails.geral}
              </a>
              . Os dados da sua conta de aluno (nome, telefone, fotografia) também podem ser corrigidos directamente em
              &ldquo;O meu perfil&rdquo;, na Área do Aluno.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">8. Conservação dos dados</h2>
            <p className="mt-2">
              Mantemos os dados enquanto a conta estiver activa ou enquanto for necessário para cumprir obrigações
              legais, fiscais ou contabilísticas (por exemplo, registos de pagamento e facturação).
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">9. Alterações a esta política</h2>
            <p className="mt-2">
              Esta política pode ser actualizada periodicamente. A data no topo desta página indica a versão mais
              recente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
