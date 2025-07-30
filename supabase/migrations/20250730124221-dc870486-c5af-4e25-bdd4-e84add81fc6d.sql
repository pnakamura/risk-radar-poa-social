-- Criar tabela para histórico de variáveis dos riscos
CREATE TABLE public.riscos_variaveis_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risco_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  nivel_risco risk_level NOT NULL,
  probabilidade risk_probability NOT NULL,
  impacto risk_impact NOT NULL,
  status risk_status NOT NULL,
  data_snapshot TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.riscos_variaveis_historico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para a tabela de histórico de variáveis
CREATE POLICY "Todos podem ver histórico de variáveis" 
ON public.riscos_variaveis_historico 
FOR SELECT 
USING (true);

CREATE POLICY "Sistema pode inserir histórico de variáveis" 
ON public.riscos_variaveis_historico 
FOR INSERT 
WITH CHECK (true);

-- Índices para melhor performance
CREATE INDEX idx_riscos_variaveis_historico_risco_id ON public.riscos_variaveis_historico(risco_id);
CREATE INDEX idx_riscos_variaveis_historico_data ON public.riscos_variaveis_historico(data_snapshot);

-- Trigger para popular automaticamente a tabela quando houver mudanças nas variáveis
CREATE OR REPLACE FUNCTION public.track_risk_variables_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  -- Obter o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Se não conseguir obter o usuário atual, usar o criado_por como fallback
  IF current_user_id IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      current_user_id := NEW.criado_por;
    ELSIF TG_OP = 'UPDATE' THEN
      current_user_id := NEW.criado_por;
    END IF;
  END IF;

  -- Para INSERT, sempre criar um snapshot inicial
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.riscos_variaveis_historico (
      risco_id, usuario_id, nivel_risco, probabilidade, impacto, status, observacoes
    ) VALUES (
      NEW.id, current_user_id, NEW.nivel_risco, NEW.probabilidade, NEW.impacto, NEW.status, 
      'Snapshot inicial do risco'
    );
    RETURN NEW;
  END IF;

  -- Para UPDATE, verificar se alguma variável mudou
  IF TG_OP = 'UPDATE' THEN
    IF (OLD.nivel_risco != NEW.nivel_risco OR 
        OLD.probabilidade != NEW.probabilidade OR 
        OLD.impacto != NEW.impacto OR 
        OLD.status != NEW.status) THEN
      
      INSERT INTO public.riscos_variaveis_historico (
        risco_id, usuario_id, nivel_risco, probabilidade, impacto, status, observacoes
      ) VALUES (
        NEW.id, current_user_id, NEW.nivel_risco, NEW.probabilidade, NEW.impacto, NEW.status,
        'Atualização das variáveis do risco'
      );
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

-- Criar trigger para capturar mudanças nas variáveis
CREATE TRIGGER track_risk_variables_changes_trigger
  AFTER INSERT OR UPDATE ON public.riscos
  FOR EACH ROW
  EXECUTE FUNCTION public.track_risk_variables_changes();

-- Habilitar realtime para a nova tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.riscos_variaveis_historico;