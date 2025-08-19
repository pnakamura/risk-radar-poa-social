-- Fix the analyze_common_causes function to properly work with existing data
CREATE OR REPLACE FUNCTION public.analyze_common_causes()
RETURNS TABLE(
  causa_descricao text,
  frequencia bigint,
  categorias text[],
  riscos_alto_impacto bigint,
  riscos_medio_impacto bigint,
  riscos_baixo_impacto bigint,
  impacto_score numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  WITH causa_stats AS (
    SELECT 
      rc.descricao as causa_descricao,
      COUNT(*) as frequencia,
      ARRAY_AGG(DISTINCT rc.categoria) FILTER (WHERE rc.categoria IS NOT NULL) as categorias,
      COUNT(*) FILTER (WHERE r.nivel_risco = 'Alto') as riscos_alto_impacto,
      COUNT(*) FILTER (WHERE r.nivel_risco = 'Médio') as riscos_medio_impacto,
      COUNT(*) FILTER (WHERE r.nivel_risco = 'Baixo') as riscos_baixo_impacto
    FROM public.riscos_causas rc
    JOIN public.riscos r ON rc.risco_id = r.id
    GROUP BY rc.descricao
    HAVING COUNT(*) >= 1  -- Changed from > 1 to >= 1 to show all causes
  )
  SELECT 
    causa_descricao,
    frequencia,
    COALESCE(categorias, ARRAY[]::text[]) as categorias,
    riscos_alto_impacto,
    riscos_medio_impacto,
    riscos_baixo_impacto,
    CASE 
      WHEN frequencia > 0 THEN 
        (riscos_alto_impacto * 3 + riscos_medio_impacto * 2 + riscos_baixo_impacto * 1)::NUMERIC / frequencia
      ELSE 0
    END as impacto_score
  FROM causa_stats
  ORDER BY impacto_score DESC, frequencia DESC;
$function$;