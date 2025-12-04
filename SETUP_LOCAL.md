# 🚀 Guia de Setup Local

## Passo a Passo para Testar Localmente

### 1. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso vai instalar todas as dependências necessárias (Next.js, React, Supabase, etc.)

### 2. Configurar Supabase

#### 2.1. Criar Conta e Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **Start your project** ou faça login
3. Clique em **New Project**
4. Preencha:
   - **Name**: escolha um nome (ex: "amigo-secreto")
   - **Database Password**: crie uma senha forte (anote ela!)
   - **Region**: escolha a região mais próxima (ex: South America)
5. Clique em **Create new project**
6. Aguarde alguns minutos enquanto o projeto é criado

#### 2.2. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **New query**
3. Abra o arquivo `supabase-setup.sql` deste projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)
7. Você deve ver uma mensagem de sucesso

#### 2.3. Obter Credenciais

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá duas informações importantes:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (uma string longa)

### 3. Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo chamado `.env.local`
2. Adicione as seguintes linhas (substitua pelos valores do seu Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Exemplo:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.exemplo...
```

⚠️ **IMPORTANTE**: 
- Não compartilhe essas credenciais publicamente
- O arquivo `.env.local` já está no `.gitignore` e não será commitado

### 4. Iniciar o Servidor de Desenvolvimento

No terminal, execute:

```bash
npm run dev
```

Você deve ver uma mensagem como:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 5. Testar a Aplicação

1. Abra seu navegador e acesse: **http://localhost:3000**

2. **Teste o fluxo completo:**
   - Clique em **Criar Evento**
   - Preencha:
     - Nome do evento: "Teste Amigo Secreto"
     - Seu nome: "João"
     - Senha: "123456"
     - Adicione pelo menos 3 participantes
   - Clique em **Criar Evento**
   - Copie o link compartilhado
   - Abra uma aba anônima/privada do navegador
   - Cole o link e digite a senha
   - Selecione um nome e confirme
   - Veja seu amigo secreto!
   - Adicione um desejo de presente
   - Veja a lista de desejos

### 6. Comandos Úteis

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Build de produção (testar build)
npm run build

# Iniciar servidor de produção (após build)
npm start

# Verificar erros de lint
npm run lint
```

### 7. Solução de Problemas

#### Erro: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

#### Erro: "Invalid API key" ou "Failed to fetch"
- Verifique se as variáveis no `.env.local` estão corretas
- Certifique-se de que copiou a **anon key** (não a service_role key)
- Reinicie o servidor (`Ctrl+C` e depois `npm run dev`)

#### Erro: "relation 'events' does not exist"
- Execute o SQL do arquivo `supabase-setup.sql` no SQL Editor do Supabase

#### Porta 3000 já está em uso
```bash
# Use outra porta
PORT=3001 npm run dev
```

#### Mudanças não aparecem
- Salve os arquivos
- O Next.js recarrega automaticamente
- Se não funcionar, pare o servidor (`Ctrl+C`) e inicie novamente

### 8. Próximos Passos

Após testar localmente e confirmar que está tudo funcionando:

1. Faça commit do código (sem o `.env.local`)
2. Faça push para o GitHub
3. Siga as instruções do `README.md` para fazer deploy na Vercel

---

**Dúvidas?** Verifique o `README.md` ou os logs do terminal para mais informações.

