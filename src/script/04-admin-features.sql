-- ETAPA 4: Funcionalidades de Admin e Mensagens Agendadas
-- Isso depende do sistema de papéis de usuário estar implementado

-- Cria a tabela scheduled_messages (depende de profiles com account_type)
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('morning', 'afternoon', 'evening')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('free', 'premium', 'all')),
  
  -- Anexos de mídia
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  
  -- Agendamento
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  
  -- Rastreamento de entrega
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela message_deliveries (depende de scheduled_messages e profiles)
CREATE TABLE IF NOT EXISTS message_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_message_id UUID REFERENCES scheduled_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela de auditoria de mudança de papel
CREATE TABLE IF NOT EXISTS role_change_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_role account_type_enum,
    new_role account_type_enum,
    changed_by UUID REFERENCES profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- Adiciona índices para melhor desempenho
CREATE INDEX IF NOT EXISTS scheduled_messages_date_idx ON scheduled_messages(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS scheduled_messages_status_idx ON scheduled_messages(status);
CREATE INDEX IF NOT EXISTS scheduled_messages_created_by_idx ON scheduled_messages(created_by);
CREATE INDEX IF NOT EXISTS message_deliveries_scheduled_message_idx ON message_deliveries(scheduled_message_id);
CREATE INDEX IF NOT EXISTS message_deliveries_user_idx ON message_deliveries(user_id);

-- Cria gatilho para atualizar o campo updated_at da tabela scheduled_messages
CREATE TRIGGER update_scheduled_messages_updated_at 
BEFORE UPDATE ON scheduled_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cria função de gatilho para auditoria de mudanças de papel
CREATE OR REPLACE FUNCTION audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Só registra se o account_type realmente mudou
    IF OLD.account_type IS DISTINCT FROM NEW.account_type THEN
        INSERT INTO role_change_audit (
            user_id,
            old_role,
            new_role,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            OLD.account_type,
            NEW.account_type,
            auth.uid(),
            CASE 
                WHEN NEW.email = 'pedrohigor2004@gmail.com' THEN 'Atribuição automática de admin'
                ELSE 'Alteração manual de papel'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria gatilho de auditoria
DROP TRIGGER IF EXISTS trigger_audit_role_changes ON profiles;
CREATE TRIGGER trigger_audit_role_changes
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_role_changes();

-- Habilita Segurança em Nível de Linha (RLS)
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_change_audit ENABLE ROW LEVEL SECURITY;

-- Cria políticas de admin (depende da coluna account_type existente)
CREATE POLICY "Admins podem gerenciar todas as mensagens agendadas" ON scheduled_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.account_type = 'ADMIN'::account_type_enum
        )
    );

CREATE POLICY "Admins podem ver todas as entregas de mensagens" ON message_deliveries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.account_type = 'ADMIN'::account_type_enum
        )
    );

CREATE POLICY "Usuários podem ver suas próprias entregas" ON message_deliveries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver auditoria de mudança de papel" ON role_change_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.account_type = 'ADMIN'::account_type_enum
        )
    );

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Etapa 4 Concluída: Funcionalidades de admin e mensagens agendadas criadas';
END $$;
