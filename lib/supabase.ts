import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!')
  console.error('Verifique se o arquivo .env.local existe e contém:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=...')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=...')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export interface Event {
  id: string
  name: string
  password: string
  created_at: string
  organizer_name: string
}

export interface Participant {
  id: string
  event_id: string
  name: string
  selected_by: string | null
  wish: string | null
  confirmed: boolean
  created_at: string
}

