-- Script de configuração do banco de dados Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organizer_name TEXT NOT NULL
);

-- Criar tabela de participantes
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  selected_by UUID REFERENCES participants(id),
  wish TEXT,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos (todos podem ler)
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Políticas para participantes (todos podem ler e inserir)
DROP POLICY IF EXISTS "Participants are viewable by everyone" ON participants;
CREATE POLICY "Participants are viewable by everyone" ON participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert participants" ON participants;
CREATE POLICY "Anyone can insert participants" ON participants
  FOR INSERT WITH CHECK (true);

-- Políticas para atualizar participantes (todos podem atualizar)
DROP POLICY IF EXISTS "Participants can update themselves" ON participants;
CREATE POLICY "Participants can update themselves" ON participants
  FOR UPDATE USING (true);

