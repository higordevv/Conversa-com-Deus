-- ETAPA 2: Modificações de Tabelas e Atualizações de Restrições
-- Esta etapa lida com atualizações nas estruturas de tabelas existentes

-- Atualiza a tabela daily_messages para suportar mensagens instantâneas
ALTER TABLE daily_messages 
DROP CONSTRAINT IF EXISTS daily_messages_message_type_check;

ALTER TABLE daily_messages 
ADD CONSTRAINT daily_messages_message_type_check 
CHECK (message_type IN ('free', 'premium', 'welcome', 'instant'));

-- Adiciona índices para melhor desempenho
CREATE INDEX IF NOT EXISTS daily_messages_user_type_idx ON daily_messages(user_id, message_type);
CREATE INDEX IF NOT EXISTS daily_messages_sent_at_idx ON daily_messages(sent_at);

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Etapa 2 Concluída: Modificações de tabela aplicadas';
END $$;
