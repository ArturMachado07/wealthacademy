// Declaração ambiente temporária, só para o `tsc --noEmit` funcionar neste
// ambiente de desenvolvimento — o pacote real "pdf-parse" não pode ser
// instalado aqui (sem acesso ao registo do npm neste sandbox). Depois de
// correr `npm install` a sério (no teu computador ou na build da Vercel), o
// pacote traz os seus próprios tipos; este ficheiro pode ser apagado nessa
// altura, mas não faz mal nenhum ficar (TypeScript prefere sempre os tipos
// reais do pacote quando existem).
declare module "pdf-parse" {
  export type PdfParseOptions = { data: Uint8Array; CanvasFactory?: unknown };
  export class PDFParse {
    constructor(options: PdfParseOptions);
    getScreenshot(options: {
      scale?: number;
      imageBuffer?: boolean;
      imageDataUrl?: boolean;
    }): Promise<{ pages: { data: Uint8Array }[] }>;
    destroy(): Promise<void>;
  }
}

declare module "pdf-parse/worker" {
  export const CanvasFactory: unknown;
}
