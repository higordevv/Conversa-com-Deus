-- ETAPA 1: Inicialização do Banco de Dados e Tabelas Principais
-- Isso combina e organiza a criação das tabelas principais

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cria a tabela profiles (tabela principal de usuários)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE, -- Adiciona restrição de UNICIDADE aqui
  whatsapp_number TEXT NOT NULL DEFAULT '',
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria índices para melhor desempenho
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_plan_type_idx ON profiles(plan_type);

-- Cria função de gatilho para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Cria gatilho para a tabela profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cria a tabela subscriptions (depende de profiles)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela daily_messages (depende de profiles)
CREATE TABLE IF NOT EXISTS daily_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('free', 'premium')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_content TEXT,
  delivery_status TEXT DEFAULT 'pending'
);

-- Habilita Segurança em Nível de Linha (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_messages ENABLE ROW LEVEL SECURITY;

-- Cria políticas básicas
CREATE POLICY "Usuários podem visualizar o próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem visualizar suas próprias assinaturas" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem visualizar suas próprias mensagens" ON daily_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Etapa 1 Concluída: Tabelas principais e políticas básicas criadas';
END $$;
