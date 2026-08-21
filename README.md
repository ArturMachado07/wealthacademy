# Wealth Academy — Website institucional (Fase 1)

Projecto Next.js (App Router) + TypeScript + Tailwind CSS. Fundação técnica + Homepage +
páginas institucionais (Sobre Nós, Formações, Workshops, Para Empresas, Eventos, Wealth
Insights, Contactos), com arquitectura preparada para Área do Aluno, LMS, Certificados e
Admin/CRM numa fase futura (ver `wealth-academy-plano-fase1.md` na pasta principal).

## Como correr localmente

Este projecto foi construído num ambiente sem acesso ao registo npm, por isso as
dependências ainda não foram instaladas nem o build foi testado aqui. No seu computador:

```bash
npm install
npm run dev     # http://localhost:3000
```

Antes de testar o gate de staging, defina a password num ficheiro `.env.local` (ver
`.env.example`):

```bash
cp .env.example .env.local
# editar STAGING_PASSWORD
```

Sem `STAGING_PASSWORD` definida, o gate fica desactivado automaticamente (comportamento
pensado para desenvolvimento local).

## Deploy na Vercel

1. Importar o repositório na Vercel.
2. Definir a variável de ambiente `STAGING_PASSWORD` (password para a direcção) e
   `NEXT_PUBLIC_SITE_URL` (URL da preview).
3. Publicar. A homepage e todas as páginas ficam protegidas por `/login` até se remover a
   password (ou até se activar antes o "Deployment Protection" nativo da Vercel, alternativa
   mais robusta ao gate incluído no código).
4. Quando o domínio definitivo (waca.ao ou wealthacademy.ao) for confirmado, associar ao
   projecto na Vercel e actualizar `NEXT_PUBLIC_SITE_URL`.

## Sobre as imagens

O ambiente onde este projecto foi construído bloqueia acesso a qualquer domínio externo
(incluindo Pixabay, Freepik e o próprio registo npm), por isso não foi possível descarregar
fotografia de bancos gratuitos como combinado. As secções que previam fotografia (Hero,
Sobre Nós, Para Empresas, cards de formação) usam blocos neutros/gradiente como placeholder.
Para adicionar imagens reais: colocar os ficheiros em `public/images/` e referenciá-los nos
componentes correspondentes (`src/components/home/Hero.tsx`, `src/components/CourseCard.tsx`,
etc.) com `next/image`.

## Estrutura

- `src/app` — páginas (App Router) e rotas de API (`/api/leads`, `/api/staging-login`).
- `src/components` — componentes reutilizáveis (Header, Footer, cards, formulários).
- `src/data` — modelos de dados (`courses`, `workshops`, `events`, `articles`,
  `instructors`, `partners`, `testimonials`, `leads`) — vazios por defeito, prontos para
  ligação a um CMS/BD sem reescrever a interface.
- `src/lib/fonts.ts` — Quiche Sans (local, `/public/fonts`) + Inter (Google Fonts).
- `src/middleware.ts` — gate de staging.

## Não implementado nesta fase (arquitectura preparada, ver plano)

Área do Aluno, LMS, Certificados/validação, Diagnóstico/Quiz, Admin/CRM. Os formulários
(`/api/leads`) já guardam os campos no formato que uma integração de CRM ou serviço de email
(ex. Resend/SMTP) vai usar — falta apenas ligar esse serviço.

## Verificação feita antes da entrega

Sem acesso ao registo npm neste ambiente não foi possível correr `next build` real. Foi
feita revisão manual de: imports (`@/...`) todos resolvidos, chaves/parênteses balanceados
em todos os ficheiros, presença de `"use client"` em todos os componentes com hooks/estado,
export default único por página/componente. Recomenda-se correr `npm run build` e
`npm run lint` localmente antes do primeiro deploy.
