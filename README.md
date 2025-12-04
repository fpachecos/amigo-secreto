# Amigo Secreto 🎁

Sistema para organização de amigo secreto sem necessidade de dados de contato.

## 🚀 Como usar

### ⚡ Setup Rápido (Resumo)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Supabase (veja instruções detalhadas abaixo)
# - Criar projeto em https://supabase.com
# - Executar supabase-setup.sql no SQL Editor
# - Copiar URL e anon key

# 3. Criar arquivo .env.local com:
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui

# 4. Iniciar servidor
npm run dev

# 5. Acessar http://localhost:3000
```

📖 **Para instruções detalhadas passo a passo, veja o arquivo [SETUP_LOCAL.md](./SETUP_LOCAL.md)**

### Deploy

#### Vercel (Recomendado - Gratuito)

1. Faça push do código para um repositório GitHub
2. Acesse [Vercel](https://vercel.com) e faça login com GitHub
3. Clique em **Add New Project**
4. Importe o repositório do GitHub
5. Configure as variáveis de ambiente:
   - Vá em **Settings** > **Environment Variables**
   - Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em **Deploy**
7. Aguarde o deploy (geralmente 1-2 minutos)
8. Seu site estará disponível em uma URL como `seu-projeto.vercel.app`

**Nota:** O plano gratuito da Vercel é suficiente para este projeto e inclui:
- Deploy ilimitado
- HTTPS automático
- Domínio personalizado (opcional)

#### Supabase Setup

1. Crie uma conta em [Supabase](https://supabase.com) (gratuito)
2. Crie um novo projeto (escolha uma região próxima)
3. No painel do Supabase, vá em **SQL Editor**
4. Execute o conteúdo do arquivo `supabase-setup.sql` (ou copie e cole o SQL)
5. Vá em **Settings** > **API**
6. Copie a **URL** do projeto e a **anon/public key**
7. Adicione essas variáveis no arquivo `.env.local` (desenvolvimento) ou nas variáveis de ambiente da Vercel (produção):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📋 Funcionalidades

- ✅ Criação de eventos por organizador com senha
- ✅ Acesso por link compartilhado
- ✅ Seleção de nome sem necessidade de dados de contato
- ✅ Confirmação via modal
- ✅ Visualização do amigo secreto após confirmação
- ✅ Cadastro de desejos de presentes
- ✅ Lista pública de participantes e desejos

## 🛠️ Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)

