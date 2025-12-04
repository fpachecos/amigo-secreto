# ⚡ Quick Start - Testar Localmente

## Comandos Rápidos

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env.local (veja abaixo o que colocar)

# 3. Iniciar servidor
npm run dev

# 4. Abrir no navegador
# http://localhost:3000
```

## Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Onde conseguir essas informações:**
1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute o SQL do arquivo `supabase-setup.sql` no SQL Editor
4. Vá em Settings > API
5. Copie a URL e a anon key

## Pronto! 🎉

Acesse http://localhost:3000 e comece a testar!

---

Para instruções mais detalhadas, veja [SETUP_LOCAL.md](./SETUP_LOCAL.md)

