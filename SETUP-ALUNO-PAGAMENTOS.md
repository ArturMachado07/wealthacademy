# Área do Aluno — Base de dados, autenticação e pagamentos

Este documento cobre a activação real (não só arquitectura) de: autenticação
de alunos, base de dados e pagamentos via Multicaixa Express. Feito por
fases — pode activar cada peça de forma independente.

## 1. Instalar as novas dependências (no seu computador)

```bash
cd ~/wealthacademy/website
npm install
```

Isto instala `@supabase/supabase-js`, `@supabase/ssr` e `resend`, já adicionados ao `package.json`.

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

O código do lado do servidor já está pronto e testável assim que tiveres as
credenciais (ver abaixo) — o que falta activar de vez são duas coisas que
não dependem de código, e que eu não posso resolver por ti:

**A. Adesão ao banco/EMIS** (para obter as credenciais técnicas):

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

**B. Preços reais das formações.** Por regra deste projecto, não se
inventam valores — o campo "Investimento" de cada formação (`src/data/
courses.ts`) está por preencher em todas. É preciso dizeres o valor (em
Kz) de cada formação que queres vender online antes de eu poder construir
o botão "Pagar" nas páginas — sem isso, ou fica sem preço, ou eu estaria a
inventar um número.

**O que já está pronto no código, à espera destas duas peças:**

- `src/lib/payments/proxypay.ts`, `/api/payments/charge`,
  `/api/payments/webhook`, `/api/payments/status/[id]`: criam a "charge"
  (QR-Code + Deeplink), o aluno paga pelo telemóvel via Multicaixa
  Express, a EMIS notifica o webhook, e o pagamento/inscrição são
  actualizados na base de dados automaticamente.
- `supabase/006_enrollment_pending_status.sql` — corre este ficheiro: a
  inscrição nasce com estado "Pendente" quando o pagamento é iniciado, e só
  passa a "Em curso" quando o pagamento é confirmado.
- Falta apenas: o botão de checkout na página da formação (chama
  `/api/payments/charge` com `courseSlug`, `courseTitle` e `amount`, mostra
  o QR-Code/deeplink, e vai verificando `/api/payments/status/[id]`) — é
  rápido de construir assim que houver um preço real para usar.

Testar primeiro no sandbox: o número `900000000` simula um pagamento
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

## 3.6. Painel Admin

Correr `supabase/005_admin.sql` no SQL Editor. Não há registo público de
admins — cria-se a conta manualmente:

1. Supabase → **Authentication → Users → Add user** — email/password da
   pessoa, marcar "Auto Confirm User".
2. Copiar o **User UID** gerado.
3. Correr no SQL Editor (substituindo os valores):

```sql
insert into admins (auth_user_id, name, email, role)
values ('<uid-copiado>', 'Nome da Pessoa', 'email@wealthacademy.ao', 'Director');
```

Depois disso, entra em `/admin/login`. O painel mostra todas as inscrições
e leads (de todos os alunos — usa a service role, não fica limitado a "ver
só o meu"), com botão para marcar uma inscrição como concluída (emite o
certificado automaticamente) e um menu para actualizar o estado de cada
lead.

## 3.7. Emails transaccionais (confirmação de inscrição, certificado)

1. Criar conta grátis em [resend.com](https://resend.com).
2. Verificar um domínio próprio (ex. `waca.ao`) em **Domains** — sem isto só
   consegues enviar para o teu próprio email de conta Resend.
3. Gerar uma API key em **API Keys**.
4. Adicionar ao `.env.local`/Vercel:

```
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Wealth Academy <notificacoes@waca.ao>
```

A partir daqui, o aluno recebe automaticamente um email quando a inscrição
é confirmada (pagamento demo ou real) e quando um certificado é emitido
pelo Admin. Sem `RESEND_API_KEY`, estes emails são simplesmente ignorados
— nada quebra, só não há notificação.

**Nota:** este é um provedor diferente do que já discutimos para os emails
de confirmação de conta/login (Supabase Auth). Se quiseres, o mesmo
domínio Resend também pode ser ligado à Supabase (Authentication → SMTP
Settings) para resolver o limite de emails do registo de alunos — usa a
mesma API key nos dois sítios.

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
