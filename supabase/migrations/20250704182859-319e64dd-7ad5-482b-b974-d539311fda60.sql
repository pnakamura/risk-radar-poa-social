
-- Recriar o trigger para executar BEFORE DELETE em vez de AFTER DELETE
-- Isso evita o erro de foreign key constraint ao deletar riscos

DROP TRIGGER IF EXISTS riscos_audit_trigger ON public.riscos;

CREATE TRIGGER riscos_audit_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.riscos
  FOR EACH ROW EXECUTE PROCEDURE public.audit_riscos();
