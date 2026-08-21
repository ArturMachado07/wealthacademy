# Deploy de validação (Vercel)

## Antes de começar — limpar um ficheiro deixado por engano

Ao preparar este passo, tentei iniciar o `git` directamente nesta pasta a partir do meu
ambiente, mas a pasta sincronizada bloqueou a operação a meio e ficou um `.git` parcial e
inválido. Não haverá qualquer perda de código (só afecta controlo de versão), mas apague-o
antes de continuar, no Terminal do seu Mac:

```bash
cd ~/wealthacademy/website
rm -rf .git
```

## 1. Inicializar o repositório (no seu Mac)

```bash
cd ~/wealthacademy/website
git init
git add .
git commit -m "Wealth Academy — Fase 1: fundação, homepage, páginas institucionais, arquitectura Área do Aluno e Admin/CRM"
```

## 2. Publicar num repositório remoto

Criar um repositório vazio no GitHub (ou GitLab/Bitbucket) e associá-lo:

```bash
git remote add origin <URL-do-repositório>
git branch -M main
git push -u origin main
```

Alternativa sem GitHub: instalar a Vercel CLI (`npm i -g vercel`) e correr `vercel` dentro
da pasta do projecto — faz deploy directo da pasta local, sem precisar de repositório.

## 3. Importar na Vercel

1. Em vercel.com → New Project → importar o repositório.
2. Framework detectado automaticamente: Next.js.
3. Definir variáveis de ambiente (Project Settings → Environment Variables):
   - `STAGING_PASSWORD` — password para a direcção aceder à preview.
   - `NEXT_PUBLIC_SITE_URL` — URL da preview (ex. `https://wealth-academy.vercel.app`), a
     actualizar depois para o domínio definitivo.
4. Deploy.

## 4. Validar

- Abrir a URL da Vercel → deve pedir a password em `/login` antes de mostrar o site.
- Percorrer todas as páginas (Início, Sobre Nós, Formações, Workshops, Para Empresas,
  Eventos, Wealth Insights, Contactos, Área do Aluno) em desktop e mobile.
- Testar os formulários (Contactos, Para Empresas, Área do Aluno) — devem responder com
  sucesso (ainda sem email/CRM ligado, mas o pedido fica registado nos logs da Vercel).
- Confirmar que `/admin` não está acessível a partir da navegação pública (só por URL
  directo) — reforçar depois com autenticação própria antes de conter dados reais.

## 5. Quando o domínio for confirmado

Associar `waca.ao` ou `wealthacademy.ao` ao projecto na Vercel (Project Settings →
Domains) e actualizar `NEXT_PUBLIC_SITE_URL`. Só nessa altura remover o gate de staging
(apagar `STAGING_PASSWORD` ou usar antes o "Deployment Protection" nativo da Vercel).
