-- FASE 1: Migração de dados e correções estruturais

-- 1. Migrar causas do campo 'causas' para a tabela 'riscos_causas'
-- Dividir causas separadas por ponto, vírgula ou quebra de linha
INSERT INTO public.riscos_causas (risco_id, descricao, categoria)
SELECT 
  r.id as risco_id,
  TRIM(causa.causa_texto) as descricao,
  CASE 
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%orçamento%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%financeiro%' THEN 'Financeiro'
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%prazo%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%cronograma%' THEN 'Cronograma'
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%recurso%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%pessoal%' THEN 'Recursos'
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%técnic%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%tecnolog%' THEN 'Técnico'
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%comunicação%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%informação%' THEN 'Comunicação'
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%legal%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%regulament%' THEN 'Legal/Regulatório'
    WHEN LOWER(TRIM(causa.causa_texto)) LIKE '%extern%' OR LOWER(TRIM(causa.causa_texto)) LIKE '%fornecedor%' THEN 'Externo'
    ELSE 'Operacional'
  END as categoria
FROM public.riscos r
CROSS JOIN LATERAL (
  SELECT UNNEST(
    STRING_TO_ARRAY(
      REGEXP_REPLACE(
        REGEXP_REPLACE(r.causas, E'\\.|;', E'\\n', 'g'), 
        E'\\n+', E'\\n', 'g'
      ), 
      E'\\n'
    )
  ) as causa_texto
) causa
WHERE r.causas IS NOT NULL 
  AND TRIM(r.causas) != ''
  AND TRIM(causa.causa_texto) != ''
  AND LENGTH(TRIM(causa.causa_texto)) > 5
  -- Evitar duplicatas exatas
  AND NOT EXISTS (
    SELECT 1 FROM public.riscos_causas rc 
    WHERE rc.risco_id = r.id 
    AND LOWER(TRIM(rc.descricao)) = LOWER(TRIM(causa.causa_texto))
  );

-- 2. Função para sincronização bidirecional
CREATE OR REPLACE FUNCTION public.sync_causas_bidirectional()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar triggers para sincronização automática
DROP TRIGGER IF EXISTS sync_causas_on_insert ON public.riscos_causas;
DROP TRIGGER IF EXISTS sync_causas_on_update ON public.riscos_causas;
DROP TRIGGER IF EXISTS sync_causas_on_delete ON public.riscos_causas;

CREATE TRIGGER sync_causas_on_insert
  AFTER INSERT ON public.riscos_causas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_causas_bidirectional();

CREATE TRIGGER sync_causas_on_update
  AFTER UPDATE ON public.riscos_causas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_causas_bidirectional();

CREATE TRIGGER sync_causas_on_delete
  AFTER DELETE ON public.riscos_causas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_causas_bidirectional();

-- 4. Função melhorada para análise de causas comuns com logs
CREATE OR REPLACE FUNCTION public.analyze_common_causes_enhanced()
RETURNS TABLE(
  causa_descricao text, 
  frequencia bigint, 
  categorias text[], 
  riscos_alto_impacto bigint, 
  riscos_medio_impacto bigint, 
  riscos_baixo_impacto bigint, 
  impacto_score numeric, 
  criticidade_score numeric, 
  tendencia_score numeric, 
  complexidade_score numeric, 
  score_final numeric, 
  confiabilidade_score numeric,
  riscos_afetados text[]
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH causa_stats AS (
    SELECT 
      rc.descricao as causa_descricao,
      COUNT(*) as frequencia,
      ARRAY_AGG(DISTINCT rc.categoria) FILTER (WHERE rc.categoria IS NOT NULL) as categorias,
      COUNT(*) FILTER (WHERE r.nivel_risco IN ('Alto', 'Crítico')) as riscos_alto_impacto,
      COUNT(*) FILTER (WHERE r.nivel_risco = 'Médio') as riscos_medio_impacto,
      COUNT(*) FILTER (WHERE r.nivel_risco = 'Baixo') as riscos_baixo_impacto,
      ARRAY_AGG(DISTINCT r.codigo) as riscos_afetados,
      -- Score de criticidade baseado na urgência e probabilidade
      AVG(
        CASE r.probabilidade
          WHEN 'Muito Alta' THEN 5
          WHEN 'Alta' THEN 4  
          WHEN 'Média' THEN 3
          WHEN 'Baixa' THEN 2
          ELSE 1
        END * 
        CASE r.impacto
          WHEN 'Muito Alto' THEN 5
          WHEN 'Alto' THEN 4
          WHEN 'Médio' THEN 3  
          WHEN 'Baixo' THEN 2
          ELSE 1
        END
      ) as criticidade_media,
      -- Score de tendência (mais recente = peso maior)
      CASE 
        WHEN COUNT(*) > 3 THEN
          COALESCE(
            (COUNT(*) FILTER (WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days')::numeric / 
             NULLIF(COUNT(*) FILTER (WHERE r.created_at >= CURRENT_DATE - INTERVAL '90 days'), 0) * 2), 1
          )
        ELSE 1
      END as tendencia_relativa,
      -- Score de complexidade baseado no número de categorias distintas
      ARRAY_LENGTH(ARRAY_AGG(DISTINCT rc.categoria) FILTER (WHERE rc.categoria IS NOT NULL), 1) as num_categorias,
      -- Confiabilidade baseada na quantidade de dados
      CASE 
        WHEN COUNT(*) >= 10 THEN 1.0
        WHEN COUNT(*) >= 5 THEN 0.8
        WHEN COUNT(*) >= 3 THEN 0.6
        ELSE 0.4
      END as confiabilidade
    FROM public.riscos_causas rc
    JOIN public.riscos r ON rc.risco_id = r.id
    GROUP BY rc.descricao
    HAVING COUNT(*) >= 1
  )
  SELECT 
    causa_descricao,
    frequencia,
    COALESCE(categorias, ARRAY[]::text[]) as categorias,
    riscos_alto_impacto,
    riscos_medio_impacto,
    riscos_baixo_impacto,
    -- Score de impacto tradicional
    CASE 
      WHEN frequencia > 0 THEN 
        (riscos_alto_impacto * 3 + riscos_medio_impacto * 2 + riscos_baixo_impacto * 1)::NUMERIC / frequencia
      ELSE 0
    END as impacto_score,
    -- Score de criticidade normalizado (0-5)
    COALESCE(criticidade_media, 0) as criticidade_score,
    -- Score de tendência normalizado (0-3)
    GREATEST(0, LEAST(3, tendencia_relativa)) as tendencia_score,
    -- Score de complexidade normalizado (0-2) 
    COALESCE(LEAST(2, num_categorias::numeric * 0.5), 0) as complexidade_score,
    -- Score final composto (ponderado)
    (
      (CASE WHEN frequencia > 0 THEN (riscos_alto_impacto * 3 + riscos_medio_impacto * 2 + riscos_baixo_impacto * 1)::NUMERIC / frequencia ELSE 0 END) * 0.35 + -- Impacto 35%
      COALESCE(criticidade_media, 0) * 0.30 + -- Criticidade 30%
      (frequencia::numeric / GREATEST(1, (SELECT MAX(sub.freq) FROM (SELECT COUNT(*) as freq FROM riscos_causas GROUP BY descricao) sub))) * 5 * 0.25 + -- Frequência normalizada 25%
      GREATEST(0, LEAST(3, tendencia_relativa)) * 0.05 + -- Tendência 5%
      COALESCE(LEAST(2, num_categorias::numeric * 0.5), 0) * 0.05 -- Complexidade 5%
    ) as score_final,
    confiabilidade as confiabilidade_score,
    riscos_afetados
  FROM causa_stats
  ORDER BY 
    (
      (CASE WHEN frequencia > 0 THEN (riscos_alto_impacto * 3 + riscos_medio_impacto * 2 + riscos_baixo_impacto * 1)::NUMERIC / frequencia ELSE 0 END) * 0.35 +
      COALESCE(criticidade_media, 0) * 0.30 +
      (frequencia::numeric / GREATEST(1, (SELECT MAX(sub.freq) FROM (SELECT COUNT(*) as freq FROM riscos_causas GROUP BY descricao) sub))) * 5 * 0.25 +
      GREATEST(0, LEAST(3, tendencia_relativa)) * 0.05 +
      COALESCE(LEAST(2, num_categorias::numeric * 0.5), 0) * 0.05
    ) DESC, 
    frequencia DESC;
$function$;