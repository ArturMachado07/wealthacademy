type Props = {
  studentName: string;
  courseTitle: string;
  hours?: string | null;
  issueDate: string;
  certificateNumber: string;
};

// Cartão com os dados do certificado — o documento válido é a
// digitalização do certificado impresso e assinado fisicamente pelo
// INEFOP, disponível para download acima deste cartão (ver
// DownloadCertificateButton nas páginas que usam este componente). Este
// cartão é só um resumo/confirmação online dos dados, não uma réplica do
// certificado em si.
export default function CertificateView({
  studentName,
  courseTitle,
  hours,
  issueDate,
  certificateNumber,
}: Props) {
  return (
    <div className="certificate-print mx-auto w-full max-w-3xl overflow-hidden rounded bg-white p-3 shadow-xl shadow-ink/10 sm:p-5">
      <div className="relative flex flex-col items-center border border-gold px-6 py-10 text-center sm:px-14 sm:py-14">
        <span className="pointer-events-none absolute left-2 top-2 h-12 w-12 border-l border-t border-gold-light/70" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-12 w-12 border-b border-r border-gold-light/70" />

        <img src="/brand/logo-fundo-claro.svg" alt="Wealth Academy" className="h-10 w-auto" />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide2 text-gold-dark">Wealth Academy</p>

        <p className="mt-8 text-xs font-semibold uppercase tracking-wide2 text-ink-soft">
          Certificado de Conclusão
        </p>
        <p className="mt-1 text-sm italic text-ink-soft">Certificamos que</p>
        <p className="mt-3 inline-block border-b border-gold-light pb-2 font-display text-3xl font-medium text-ink sm:text-4xl">
          {studentName}
        </p>

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-soft">
          concluiu com aproveitamento a formação <strong className="font-semibold text-ink">{courseTitle}</strong>,
          promovida pela Wealth Academy{hours ? (
            <>
              , com a carga horária total de <strong className="font-semibold text-ink">{hours}</strong>
            </>
          ) : null}
          .
        </p>

        <div className="mt-10 w-full border-t border-ink/10 pt-6 text-center">
          <p className="text-xs font-semibold text-ink">{certificateNumber}</p>
          <p className="mt-0.5 text-[11px] text-ink-soft">
            Emitido em {new Date(issueDate).toLocaleDateString("pt-PT")}
          </p>
          <p className="mt-3 text-[11px] text-ink-soft">
            Documento assinado fisicamente pelo INEFOP — descarregue a versão digitalizada acima.
          </p>
        </div>
      </div>
    </div>
  );
}
