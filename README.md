## CRTE Chamados

Portal de registro e acompanhamento de chamados pedagógicos e tecnológicos do CRTE do Núcleo de Educação AMS. A autenticação é fornecida pelo [Clerk](https://clerk.com/) e o armazenamento de dados fica no [Supabase](https://supabase.com/).

## Pré-requisitos

- Node.js 18 ou superior;
- Conta no Clerk com uma aplicação criada;
- Projeto Supabase com as tabelas provisionadas (ver `supabase/schema.sql`).

## Configuração de variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as chaves do Clerk e do Supabase:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

SUPABASE_URL="https://<sua-instancia>.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUx..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> O `SUPABASE_SERVICE_ROLE_KEY` deve ser mantido apenas no backend. Ele é usado em Server Actions para sincronizar perfis e criar chamados.

Defina também as URLs de redirecionamento no painel do Clerk:

- **Sign-in redirect**: `http://localhost:3000/dashboard`
- **Sign-up redirect**: `http://localhost:3000/dashboard`

## Banco de dados

Execute o script `supabase/schema.sql` no seu projeto Supabase para criar tabelas, gatilhos e políticas RLS necessárias. Você pode usar o SQL Editor do Supabase:

```sql
-- copie o conteúdo de supabase/schema.sql e execute no painel SQL
```

## Desenvolvimento

Instale as dependências e execute o projeto em modo desenvolvimento:

```bash
npm install
npm run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000).

## Fluxo principal

- Visitantes acessam a home (`/`) e realizam o cadastro/login com Clerk;
- Usuários autenticados são direcionados ao painel `/dashboard`;
- Ao acessar o painel, o perfil é sincronizado na tabela `profiles` do Supabase;
- O formulário “Novo chamado” cria registros associados ao usuário na tabela `tickets`;
- A lista “Seus chamados” recupera os chamados do usuário autenticado.

## Deploy

Para publicar o projeto, configure as mesmas variáveis de ambiente na plataforma escolhida (Vercel, Netlify etc.) e certifique-se de informar as URLs de redirecionamento públicas no painel do Clerk e nas configurações do Supabase (Allowed Origins).
