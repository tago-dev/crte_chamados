-- Adiciona a coluna os_celepar à tabela tickets
-- Esta coluna armazenará o número da OS da CELEPAR quando o status for "aguardando_os"

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS os_celepar TEXT;

-- Adiciona um comentário para documentar o propósito da coluna
COMMENT ON COLUMN tickets.os_celepar IS 'Número da OS da CELEPAR quando o ticket está aguardando abertura de OS';