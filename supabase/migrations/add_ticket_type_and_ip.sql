-- Migração para adicionar campos de tipo de solicitação e IP da máquina
-- Esta migração adiciona:
-- - tipo: para distinguir entre solicitações pedagógicas e técnicas
-- - ip_maquina: para armazenar o IP da máquina em solicitações técnicas

-- Adiciona o campo tipo à tabela tickets
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (
    tipo IN ('pedagogico', 'tecnico')
) DEFAULT 'pedagogico';

-- Adiciona o campo ip_maquina à tabela tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ip_maquina TEXT;

-- Adiciona comentários para documentar o propósito das colunas
COMMENT ON COLUMN tickets.tipo IS 'Tipo de solicitação: pedagogico ou tecnico';

COMMENT ON COLUMN tickets.ip_maquina IS 'IP da máquina para solicitações técnicas';

-- Adiciona índice para melhor performance em buscas por tipo
CREATE INDEX IF NOT EXISTS idx_tickets_tipo ON tickets (tipo);

-- Adiciona índice para IP da máquina (opcional, para buscas futuras)
CREATE INDEX IF NOT EXISTS idx_tickets_ip_maquina ON tickets (ip_maquina)
WHERE
    ip_maquina IS NOT NULL;