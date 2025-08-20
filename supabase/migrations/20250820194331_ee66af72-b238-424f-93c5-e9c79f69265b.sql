-- Corrigir warning de segurança: Function Search Path Mutable
-- Atualizar a função para usar search_path fixo

CREATE OR REPLACE FUNCTION public.sync_causas_bidirectional()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  causas_concatenadas TEXT;
BEGIN
  -- Quando causas estruturadas mudam, atualizar o campo causas
  IF TG_TABLE_NAME = 'riscos_causas' THEN
    -- Concatenar todas as causas do risco
    SELECT STRING_AGG(descricao, '. ') INTO causas_concatenadas
    FROM public.riscos_causas 
    WHERE risco_id = COALESCE(NEW.risco_id, OLD.risco_id)
    ORDER BY created_at;
    
    -- Atualizar o campo causas no risco
    UPDATE public.riscos 
    SET causas = causas_concatenadas, updated_at = NOW()
    WHERE id = COALESCE(NEW.risco_id, OLD.risco_id);
    
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  RETURN NULL;
END;
$$;