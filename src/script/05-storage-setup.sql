-- ETAPA 5: Configuração de Armazenamento para Uploads de Arquivos
-- Cria buckets de armazenamento para anexos de mensagens

-- Cria bucket de armazenamento para anexos de mensagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,
  10485760, -- Limite de 10MB
  ARRAY['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Cria políticas de armazenamento
CREATE POLICY "Admins podem enviar anexos de mensagens" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'ADMIN'::account_type_enum
  )
);

CREATE POLICY "Admins podem visualizar anexos de mensagens" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'ADMIN'::account_type_enum
  )
);

CREATE POLICY "Admins podem deletar anexos de mensagens" ON storage.objects
FOR DELETE USING (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'ADMIN'::account_type_enum
  )
);

-- Acesso público para visualização de arquivos (necessário para o WhatsApp)
CREATE POLICY "Público pode visualizar anexos de mensagens" ON storage.objects
FOR SELECT USING (bucket_id = 'message-attachments');

-- Atualiza a tabela scheduled_messages para incluir caminhos dos arquivos
ALTER TABLE scheduled_messages 
ADD COLUMN IF NOT EXISTS image_file_path TEXT,
ADD COLUMN IF NOT EXISTS video_file_path TEXT,
ADD COLUMN IF NOT EXISTS audio_file_path TEXT,
ADD COLUMN IF NOT EXISTS image_file_size INTEGER,
ADD COLUMN IF NOT EXISTS video_file_size INTEGER,
ADD COLUMN IF NOT EXISTS audio_file_size INTEGER;

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Etapa 7 Concluída: Buckets de armazenamento e políticas criadas';
END $$;
