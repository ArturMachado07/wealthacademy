# Área do Aluno — Base de dados, autenticação e pagamentos

Este documento cobre a activação real (não só arquitectura) de: autenticação
de alunos, base de dados e pagamentos via Multicaixa Express. Feito por
fases — pode activar cada peça de forma independente.

## 1. Instalar as novas dependências (no seu computador)

```bash
cd ~/wealthacademy/website
npm install
```

Isto instala `@supabase/supabase-js` e `@supabase/ssr`, já adicionados ao `package.json`.

## 2. Criar o projecto Supabase — ✅ concluído

1. Criar conta/projecto gratuito em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copiar `Project URL`, a `publishable key`
   e a `secret key` (nomenclatura actual da Supabase — substituem os antigos
   "anon public key" / "service_role key").
3. Em **SQL Editor**, colar e correr o conteúdo de `supabase/schema.sql`
   (cria as tabelas `students`, `enrollments`, `certificates`, `payments`,
   `leads`, com Row Level Security já configurado).
4. **Correr também `supabase/002_auto_create_student.sql`** — cria um
   trigger que, sempre que alguém se regista em `/aluno/registo`, gera
   automaticamente o registo correspondente na tabela `students`. Sem este
   passo, o login funciona mas o dashboard não encontra o aluno.
5. Adicionar as três variáveis ao `.env.local` (local) e à Vercel
   (Project Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

Com isto, `src/lib/auth.ts` (`getCurrentStudent`) já verifica sessões
reais, e os ecrãs `/aluno/login`, `/aluno/registo` e o dashboard `/aluno`
já estão construídos e ligados ao Supabase Auth + base de dados. Falta
confirmar em Supabase → **Authentication → Providers → Email** se a
confirmação por email está activa (por defeito está) — se estiver, um
aluno recém-registado só consegue entrar depois de clicar no link enviado
por email.

## 3. Activar pagamentos (Multicaixa Express / EMIS GPO)

Isto depende de uma adesão fora do código:

1. Contactar o banco que dá suporte à conta da Wealth Academy para aderir
   ao **Gateway de Pagamentos Online (GPO)** da EMIS/MULTICAIXA.
2. Escolher integração **API** (é a que este código usa) em vez de iFRAME.
3. Após aprovação, a EMIS atribui um **POS_ID**; a ProxyPay (interface
   técnica para o GPO) fornece o **token Bearer** da API — começar pelo
   ambiente sandbox (`api.sandbox.proxypay.co.ao`) antes de produção.
4. Adicionar ao `.env.local`/Vercel:

```
PROXYPAY_API_TOKEN=...
PROXYPAY_POS_ID=...
```

5. O fluxo já implementado (`src/lib/payments/proxypay.ts`,
   `/api/payments/charge`, `/api/payments/webhook`): cria uma "charge"
   (QR-Code + Deeplink), o aluno paga pelo telemóvel via Multicaixa
   Express, a EMIS notifica o webhook, e o pagamento/inscrição são
   actualizados na base de dados automaticamente.
6. Testar primeiro no sandbox: o número `900000000` simula um pagamento
   aceite; `900003000` simula uma recusa (ver documentação da ProxyPay).

Documentação oficial usada: [ProxyPay OPG API](https://developer.proxypay.co.ao/opg/v1/).

## 3.5. Certificados

Correr também `supabase/004_certificate_numbering.sql` — faz o número do
certificado (ex. `WA-2026-0001`) gerar-se sozinho a cada inscrição concluída.

Como ainda não existe painel Admin, emitir um certificado é manual: no SQL
Editor da Supabase,

```sql
update enrollments set status = 'Concluída' where id = '<id da inscrição>';

insert into certificates (student_id, enrollment_id, course_title, hours)
select student_id, id, course_title, '16 horas'
from enrollments
where id = '<id da inscrição>';
```

O número do certificado é gerado automaticamente. O aluno vê-o de imediato
no dashboard, com um link para a validação pública em
`/validar/<numero-do-certificado>` — página que qualquer pessoa (sem login)
pode abrir para confirmar a autenticidade.

## 4. O que ainda falta depois disto (não incluído aqui)

- Ligar inscrições reais: hoje uma inscrição só aparece no dashboard do
  aluno se for inserida manualmente na tabela `enrollments` (via Supabase)
  — ainda não há um fluxo de "inscrever-me numa formação" no site público
  que crie essa linha automaticamente.
- Conteúdo do LMS em si (vídeo-aulas, materiais, avaliações).
- Geração de certificados (PDF + QR code) e página `/validar/WA-XXXX`.
- Emails transaccionais (confirmação de inscrição/pagamento).
- Autenticação própria do Admin (hoje `src/lib/admin-auth.ts` também
  devolve sempre `null`).
