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

## 3.8. Conteúdo do LMS (módulos, aulas, progresso)

Correr `supabase/007_lms_content.sql` no SQL Editor — cria as tabelas
`course_modules`, `lessons` e `lesson_progress`, com RLS: um aluno só vê o
conteúdo de uma formação em que está inscrito (estado "Em curso" ou
"Concluída").

Depois disso, em `/admin/formacoes` (link no topo do Painel Admin) é
possível, por formação:

1. Adicionar módulos (ex. "Módulo 1 — Introdução").
2. Dentro de cada módulo, adicionar aulas: título, descrição opcional,
   tipo de vídeo (YouTube/Vimeo — colar o link de **incorporação/embed**,
   não o link normal; ou "Ficheiro directo" para um `.mp4` alojado algures),
   duração em minutos e um link opcional para materiais (PDF, etc.).
3. Eliminar módulos/aulas a qualquer momento.

Não é preciso tocar em código para gerir o conteúdo — tudo passa pelo
painel.

O aluno acede ao curso a partir do botão **"Aceder ao curso"** no seu
dashboard (`/aluno`), que aparece em qualquer inscrição "Em curso" ou
"Concluída". Cada aula marcada como concluída actualiza automaticamente a
percentagem de progresso da inscrição (o estado "Concluída"/emissão de
certificado continua a ser sempre uma decisão manual do Admin).

### Testes por aula (opcional)

Correr `supabase/011_lms_quizzes.sql`. Em `/admin/formacoes/[curso]`, cada
aula tem agora um link **"Teste"** onde dá para definir a nota mínima e
adicionar perguntas de escolha múltipla (marcando qual é a opção correcta).

Uma aula sem perguntas continua a funcionar como antes — o aluno marca-a
como concluída manualmente. Assim que a primeira pergunta é adicionada, o
botão manual desaparece e o aluno passa a ter de responder ao teste e
atingir a nota mínima para a aula contar como concluída (pode repetir o
teste quantas vezes precisar). As respostas correctas nunca são enviadas
ao browser antes de o aluno submeter — a correcção é sempre feita no
servidor.

## 3.9. Emails do Supabase Auth em português, com logo

Por defeito, os emails de confirmação de conta e recuperação de password
(enviados directamente pelo Supabase Auth, via SMTP configurado em 3.7) vêm
em inglês e sem marca. Ficheiros prontos a colar em `supabase/email-
templates/`:

1. Supabase → **Authentication → Email Templates**.
2. Abrir **"Confirm signup"**: colar o *Subject heading*
   `Confirme o seu email — Wealth Academy` e, no corpo, o conteúdo de
   `supabase/email-templates/confirm-signup.html`.
3. Abrir **"Reset Password"**: colar o *Subject heading*
   `Redefinir a sua password — Wealth Academy` e, no corpo, o conteúdo de
   `supabase/email-templates/reset-password.html`.
4. Guardar cada um.

Os restantes templates do Supabase Auth (não usados nos fluxos actuais do
site, mas o Supabase pode disparar se algum dia se usar login por link,
convites manuais ou troca de email) também têm versão em português, pela
mesma lógica — Subject sugerido entre parêntesis:

- **Magic Link** (`O seu link de acesso — Wealth Academy`) →
  `supabase/email-templates/magic-link.html`
- **Invite user** (`Foi convidado para a Wealth Academy`) →
  `supabase/email-templates/invite-user.html`
- **Change Email Address** (`Confirme o seu novo email — Wealth Academy`) →
  `supabase/email-templates/change-email.html`
- **Reauthentication** (`O seu código de confirmação — Wealth Academy`) →
  `supabase/email-templates/reauthentication.html`

O logótipo é carregado a partir de `/brand/logo-email.png` (já no
`public/`, gerado a partir do SVG oficial) — funciona porque essa rota
está fora do gate de staging. Quando o domínio final estiver ligado, basta
que o ficheiro continue a existir em `public/brand/logo-email.png`; não é
preciso alterar os templates.

## 3.10. Preço/data por formação e Wealth Insights, editáveis sem deploy

Correr `supabase/009_course_pricing.sql` e `supabase/010_wealth_insights.sql`.
Com isto, em `/admin/formacoes/[curso]` dá para editar preço e data de cada
formação, e em `/admin/insights` dá para criar/editar autores e artigos do
Wealth Insights (incluindo diagnóstico de fotos em falta) — tudo sem tocar
em código.

## 3.11. Analytics e SEO

O site já tem metadata, Open Graph, `sitemap.xml` e `robots.txt` (bloqueando
áreas privadas: `/admin`, `/aluno`, `/login`, `/api`). As páginas de
formação têm dados estruturados `Course` e os artigos têm `Article`
(schema.org), para ajudar o Google a mostrar resultados mais ricos —
propositadamente sem preço nos dados estruturados, porque os valores
actuais são demo.

Google Analytics e Meta Pixel estão prontos no código mas desligados por
defeito (sem inventar IDs de teste). Para activar, adicionar à Vercel:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
```

Sem estas variáveis, nenhum script de acompanhamento é carregado.

## 3.12. Assistente de IA (substitui o botão do WhatsApp)

O botão flutuante do site passa a ser um chat — responde sobre formações
(investimento, datas, conteúdos) usando sempre os dados reais do catálogo,
nunca inventa informação, e tem sempre um botão "Falar com uma pessoa no
WhatsApp" visível para quem precisar de um humano (inscrições, pagamentos,
reclamações). Sem a chave abaixo configurada, o botão continua a ser o
WhatsApp normal, como hoje — nada muda até a activarem.

1. Criar conta em [console.anthropic.com](https://console.anthropic.com).
2. Em **Billing**, carregar saldo (é pré-pago — não é uma subscrição
   mensal fixa; paga-se por uso, e o modelo por defeito usado aqui é o mais
   económico da gama).
3. Em **API Keys**, gerar uma nova chave.
4. Adicionar ao `.env.local`/Vercel:

```
ANTHROPIC_API_KEY=...
```

A partir daqui o botão flutuante muda automaticamente para o chat — não é
preciso mexer em código nem redeployar mais nada além de definir a
variável.

## 4. O que ainda falta depois disto (não incluído aqui)

- Credenciais reais ProxyPay/EMIS e preços oficiais das formações (ver
  secção 3) — sem isto os pagamentos continuam em modo demo.
- Domínio próprio verificado no Resend — sem isto os emails só chegam à
  conta do próprio Resend, não a alunos reais.
