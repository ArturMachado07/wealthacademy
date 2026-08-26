-- Campos adicionais do formulário "Para Empresas" (cargo, nº de
-- participantes, necessidade de formação, modalidade preferencial e
-- mensagem) que já eram enviados pelo formulário mas nunca chegavam a ser
-- guardados — ficavam perdidos entre o browser e a base de dados.
alter table leads
  add column if not exists role text,
  add column if not exists participants text,
  add column if not exists training_need text,
  add column if not exists preferred_modality text,
  add column if not exists message text;
