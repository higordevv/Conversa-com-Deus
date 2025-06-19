-- ETAPA 3: Implementação do Sistema de Papéis de Usuário (User Roles)
-- Isso deve vir antes das funcionalidades de admin que dependem dos papéis

-- Cria o tipo ENUM para tipos de conta
DO $$ BEGIN
    CREATE TYPE account_type_enum AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'ENUM account_type_enum já existe, ignorando a criação';
END $$;

-- Adiciona a coluna account_type à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_type account_type_enum DEFAULT 'USER'::account_type_enum NOT NULL;

-- Cria índice para consultas baseadas em papéis
CREATE INDEX IF NOT EXISTS profiles_account_type_idx ON profiles(account_type);

-- Cria função de atribuição automática de admin
CREATE OR REPLACE FUNCTION assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica se o e-mail é o do administrador principal
    IF NEW.email = 'pedrohigor2004@gmail.com' THEN
        NEW.account_type = 'ADMIN'::account_type_enum;
    END IF;
    
    -- Garante que account_type nunca será NULL
    IF NEW.account_type IS NULL THEN
        NEW.account_type = 'USER'::account_type_enum;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria gatilhos para atribuição automática de admin
DROP TRIGGER IF EXISTS trigger_assign_admin_role ON profiles;
CREATE TRIGGER trigger_assign_admin_role
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_admin_role();

DROP TRIGGER IF EXISTS trigger_assign_admin_role_update ON profiles;
CREATE TRIGGER trigger_assign_admin_role_update
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.account_type IS NULL)
    EXECUTE FUNCTION assign_admin_role();

-- Cria funções de gerenciamento de papéis
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE profiles 
    SET account_type = 'ADMIN'::account_type_enum 
    WHERE email = user_email;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    IF rows_affected > 0 THEN
        RAISE NOTICE 'Usuário % promovido para ADMIN', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Usuário % não encontrado', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION demote_admin_to_user(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    -- Impede a despromoção do admin principal
    IF user_email = 'pedrohigor2004@gmail.com' THEN
        RAISE EXCEPTION 'Não é possível rebaixar o usuário administrador principal';
    END IF;
    
    UPDATE profiles 
    SET account_type = 'USER'::account_type_enum 
    WHERE email = user_email AND account_type = 'ADMIN'::account_type_enum;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    IF rows_affected > 0 THEN
        RAISE NOTICE 'Admin % rebaixado para USER', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Admin % não encontrado ou já é USER', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND account_type = 'ADMIN'::account_type_enum
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS account_type_enum AS $$
DECLARE
    user_role account_type_enum;
BEGIN
    SELECT account_type INTO user_role
    FROM profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'USER'::account_type_enum);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION count_users_by_role()
RETURNS TABLE(role account_type_enum, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.account_type as role,
        COUNT(*) as count
    FROM profiles p
    GROUP BY p.account_type
    ORDER BY p.account_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS TABLE(
    id UUID,
    email TEXT,
    whatsapp_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.whatsapp_number,
        p.created_at
    FROM profiles p
    WHERE p.account_type = 'ADMIN'::account_type_enum
    ORDER BY p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria visualizações para diferentes tipos de usuários
CREATE OR REPLACE VIEW admin_users AS
SELECT 
    id,
    email,
    whatsapp_number,
    plan_type,
    account_type,
    created_at,
    updated_at
FROM profiles 
WHERE account_type = 'ADMIN'::account_type_enum;

CREATE OR REPLACE VIEW regular_users AS
SELECT 
    id,
    email,
    whatsapp_number,
    plan_type,
    account_type,
    created_at,
    updated_at
FROM profiles 
WHERE account_type = 'USER'::account_type_enum;

-- Concede permissões
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON regular_users TO authenticated;

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Etapa 3 Concluída: Sistema de papéis de usuário implementado';
END $$;
