-- Fix the search_path issue for the analyze_common_causes function
CREATE OR REPLACE FUNCTION public.analyze_common_causes()
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
   confiabilidade_score numeric
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
    confiabilidade as confiabilidade_score
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
$function$