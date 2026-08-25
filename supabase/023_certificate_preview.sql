-- Corre este ficheiro no SQL Editor do Supabase.
-- Guarda a imagem de pré-visualização (1ª página do PDF renderizada em PNG,
-- ver src/lib/pdf-preview.ts) gerada automaticamente quando o Admin anexa um
-- certificado em PDF — permite mostrar o certificado directamente na página,
-- sem o visualizador de PDF do browser. O ficheiro original continua a ser
-- o que se descarrega (certificates.file_path); esta coluna é só a imagem.

alter table certificates
  add column if not exists preview_path text;
