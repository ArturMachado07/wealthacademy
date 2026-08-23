import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description: "Termos e condições de utilização do site e da plataforma da Wealth Academy.",
};

export default function TermosPage() {
  return (
    <section className="py-24">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Legal" title="Termos e Condições" />

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft">
          <p className="text-xs text-ink-soft/70">
            Última actualização: {new Date().toLocaleDateString("pt-PT")}. Este documento é um ponto de partida —
            recomenda-se revisão por um jurista antes de ser tratado como definitivo.
          </p>

          <div>
            <h2 className="text-base font-medium text-ink">1. Sobre estes termos</h2>
            <p className="mt-2">
              Estes termos regulam a utilização do site e da plataforma da Wealth Academy, uma marca de The Finance
              Boutique, Wealth Management &amp; Advisory Services, Lda. (registo INEFOP 1140.01/LDA./2024), com sede
              em {siteConfig.address}. Ao criar uma conta, inscrever-se numa formação ou usar o site, aceita estes
              termos.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">2. Formações e workshops</h2>
            <p className="mt-2">
              As formações e workshops divulgados no site estão sujeitos a confirmação de vagas e podem ter datas,
              conteúdos ou formadores ajustados pela Wealth Academy, sempre com aviso prévio ao aluno inscrito quando
              a alteração for relevante.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">3. Inscrição e pagamento</h2>
            <p className="mt-2">
              A inscrição numa formação só fica confirmada após a confirmação do respectivo pagamento. Os preços
              apresentados incluem os impostos aplicáveis, salvo indicação em contrário. O pagamento é processado
              através do Multicaixa Express (ProxyPay/EMIS GPO); outros métodos poderão vir a estar disponíveis e
              serão claramente identificados como tal no momento da inscrição.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">4. Cancelamento e reembolso</h2>
            <p className="mt-2">
              Pedidos de cancelamento ou reembolso devem ser dirigidos directamente à Wealth Academy, através de{" "}
              <a href={`mailto:${siteConfig.emails.geral}`} className="text-gold-dark underline">
                {siteConfig.emails.geral}
              </a>{" "}
              ou do WhatsApp, e serão avaliados caso a caso, considerando o tempo decorrido desde a inscrição e o
              início efectivo da formação.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">5. Acesso à plataforma e certificados</h2>
            <p className="mt-2">
              O acesso ao conteúdo de uma formação é pessoal e intransmissível, associado à conta do aluno. Os
              certificados são emitidos após a conclusão dos requisitos definidos para cada formação e incluem um
              número único, verificável publicamente através do link de validação indicado no próprio certificado.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">6. Conduta do utilizador</h2>
            <p className="mt-2">
              O utilizador compromete-se a não partilhar as suas credenciais de acesso, não copiar ou redistribuir o
              conteúdo das formações sem autorização, e a usar o site e a plataforma de forma lícita e respeitadora
              dos direitos de terceiros.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">7. Propriedade intelectual</h2>
            <p className="mt-2">
              O conteúdo das formações, materiais, marca e restante conteúdo do site são propriedade da Wealth
              Academy/The Finance Boutique, Wealth Management &amp; Advisory Services, Lda., ou dos respectivos
              formadores, e não podem ser reproduzidos sem autorização prévia.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">8. Limitação de responsabilidade</h2>
            <p className="mt-2">
              A Wealth Academy envida os melhores esforços para garantir a disponibilidade e correcção do site e da
              plataforma, mas não garante a ausência de interrupções, erros ou indisponibilidades pontuais.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">9. Alterações a estes termos</h2>
            <p className="mt-2">
              Estes termos podem ser actualizados periodicamente. A data no topo desta página indica a versão mais
              recente. A utilização continuada do site após uma alteração implica a aceitação dos novos termos.
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-ink">10. Contacto</h2>
            <p className="mt-2">
              Para qualquer questão sobre estes termos, contacte-nos em{" "}
              <a href={`mailto:${siteConfig.emails.geral}`} className="text-gold-dark underline">
                {siteConfig.emails.geral}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
