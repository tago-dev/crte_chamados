-- Migração para mover CPF, RG do usuário para o ticket e adicionar título
-- Esta migração move os campos CPF e RG da tabela profiles para tickets
-- e adiciona um campo de título para os chamados

-- Adiciona os novos campos à tabela tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS titulo TEXT;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS cpf TEXT;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS rg TEXT;

-- Adiciona comentários para documentar o propósito das colunas
COMMENT ON COLUMN tickets.titulo IS 'Título do chamado definido pelo usuário';

COMMENT ON COLUMN tickets.cpf IS 'CPF do solicitante (somente números)';

COMMENT ON COLUMN tickets.rg IS 'RG do solicitante';

-- Remove as colunas CPF e RG da tabela profiles (elas não são mais necessárias no usuário)
ALTER TABLE profiles DROP COLUMN IF EXISTS cpf;

ALTER TABLE profiles DROP COLUMN IF EXISTS rg;

-- Remove os índices relacionados aos campos removidos (se existirem)
DROP INDEX IF EXISTS idx_profiles_cpf;

DROP INDEX IF EXISTS idx_profiles_rg;

-- Adiciona índices para melhor performance em buscas nos tickets (opcional)
CREATE INDEX IF NOT EXISTS idx_tickets_cpf ON tickets (cpf)
WHERE
    cpf IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_rg ON tickets (rg)
WHERE
    rg IS NOT NULL;