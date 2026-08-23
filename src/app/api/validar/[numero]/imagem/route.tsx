import { ImageResponse } from "next/og";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Imagem (1200x630) usada como pré-visualização ao partilhar o certificado
// no LinkedIn (og:image em /validar/[numero]) — gerada com next/og
// (bundled no Next.js, sem dependências novas). Público, sem sessão.
export const dynamic = "force-dynamic";

type CertificateRow = {
  certificate_number: string;
  course_title: string;
  issue_date: string;
  students: { name: string } | { name: string }[] | null;
};

const CREAM = "#F8F6EA";
const GOLD = "#9D743A";
const GOLD_LIGHT = "#C79A5D";
const GOLD_DARK = "#7A5A2C";
const INK = "#352C29";
const INK_SOFT = "#57493F";

export async function GET(request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;

  const supabase = createSupabaseAdminClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("certificate_number, course_title, issue_date, students(name)")
    .eq("certificate_number", numero)
    .maybeSingle<CertificateRow>();

  const studentName = Array.isArray(certificate?.students)
    ? certificate?.students[0]?.name
    : certificate?.students?.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          padding: "36px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${GOLD}`,
            padding: "40px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "10px",
              border: `1px solid ${GOLD_LIGHT}`,
            }}
          />

          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: "0.1em", color: GOLD_DARK }}>
            WEALTH ACADEMY
          </div>

          {certificate && studentName ? (
            <>
              <div
                style={{
                  display: "flex",
                  marginTop: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: INK_SOFT,
                }}
              >
                CERTIFICADO DE CONCLUSÃO
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 34,
                  fontSize: 56,
                  fontWeight: 700,
                  color: INK,
                  borderBottom: `2px solid ${GOLD_LIGHT}`,
                  paddingBottom: 14,
                }}
              >
                {studentName}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 26,
                  fontSize: 26,
                  fontWeight: 600,
                  color: INK,
                  maxWidth: 880,
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                {certificate.course_title}
              </div>

              <div style={{ display: "flex", marginTop: 34, fontSize: 15, color: INK_SOFT }}>
                {certificate.certificate_number} · {new Date(certificate.issue_date).toLocaleDateString("pt-PT")}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", marginTop: 24, fontSize: 22, color: INK_SOFT }}>
              Certificado não encontrado
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
