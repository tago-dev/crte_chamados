-- Adiciona as colunas CPF e RG à tabela profiles
-- Essas colunas armazenarão os documentos dos usuários para identificação

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rg TEXT;

-- Adiciona comentários para documentar o propósito das colunas
COMMENT ON COLUMN profiles.cpf IS 'CPF do usuário (somente números)';

COMMENT ON COLUMN profiles.rg IS 'RG do usuário';

-- Adiciona índices para melhor performance em buscas (opcional)
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON profiles (cpf)
WHERE
    cpf IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_rg ON profiles (rg)
WHERE
    rg IS NOT NULL;