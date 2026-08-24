-- Corre este ficheiro no SQL Editor do Supabase.
-- Adiciona uma data real (ISO) aos workshops, separada do campo `date` de
-- texto livre já existente (ex. "28 de Fevereiro e 7 de Março" — útil para
-- exibição, mas inválido para o Google). O schema.org/Event exige startDate
-- em formato ISO 8601 para ser elegível a resultados ricos — sem uma data
-- real, o Event não é emitido para esse workshop (ver WorkshopJsonLd.tsx).

alter table workshops add column if not exists event_date date;
