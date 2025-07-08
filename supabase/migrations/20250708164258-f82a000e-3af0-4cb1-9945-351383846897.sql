-- Corrigir o trigger de auditoria - deve ser AFTER para operações INSERT/UPDATE
-- O problema é que BEFORE INSERT tenta inserir no histórico antes do risco existir

DROP TRIGGER IF EXISTS riscos_audit_trigger ON public.riscos;

-- Recriar a função de auditoria (mantendo a mesma lógica)
CREATE OR REPLACE FUNCTION public.audit_riscos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se o usuário existe na tabela profiles
  IF current_user_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = current_user_id
  ) THEN
    -- Se não existir, usar o criado_por do registro como fallback
    IF TG_OP = 'INSERT' THEN
      current_user_id := NEW.criado_por;
    ELSIF TG_OP = 'UPDATE' THEN
      current_user_id := NEW.criado_por;
    ELSIF TG_OP = 'DELETE' THEN
      current_user_id := OLD.criado_por;
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.riscos_historico (risco_id, usuario_id, acao, dados_novos)
    VALUES (NEW.id, current_user_id, 'CREATE', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.riscos_historico (risco_id, usuario_id, acao, dados_anteriores, dados_novos)
    VALUES (NEW.id, current_user_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.riscos_historico (risco_id, usuario_id, acao, dados_anteriores)
    VALUES (OLD.id, current_user_id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Recriar o trigger com timing correto:
-- AFTER para INSERT/UPDATE (para que o risco já exista)
-- BEFORE para DELETE (para capturar dados antes da exclusão)
CREATE TRIGGER riscos_audit_trigger
  AFTER INSERT OR UPDATE ON public.riscos
  FOR EACH ROW EXECUTE PROCEDURE public.audit_riscos();

CREATE TRIGGER riscos_audit_delete_trigger
  BEFORE DELETE ON public.riscos
  FOR EACH ROW EXECUTE PROCEDURE public.audit_riscos();