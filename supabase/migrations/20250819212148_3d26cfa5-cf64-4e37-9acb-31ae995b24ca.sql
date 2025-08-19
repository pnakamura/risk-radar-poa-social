-- Create table for risk causes with categories
CREATE TABLE public.riscos_causas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risco_id UUID NOT NULL REFERENCES public.riscos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.riscos_causas ENABLE ROW LEVEL SECURITY;

-- Create policies for riscos_causas
CREATE POLICY "Todos podem ver causas dos riscos" 
ON public.riscos_causas 
FOR SELECT 
USING (true);

CREATE POLICY "Analistas podem criar causas" 
ON public.riscos_causas 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'gestor'::user_role) OR 
  has_role(auth.uid(), 'analista'::user_role)
);

CREATE POLICY "Criadores e gestores podem editar causas" 
ON public.riscos_causas 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.riscos 
    WHERE id = risco_id AND (criado_por = auth.uid() OR is_admin_or_gestor(auth.uid()))
  )
);

CREATE POLICY "Criadores e gestores podem deletar causas" 
ON public.riscos_causas 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.riscos 
    WHERE id = risco_id AND (criado_por = auth.uid() OR is_admin_or_gestor(auth.uid()))
  )
);

-- Create indexes for better performance
CREATE INDEX idx_riscos_causas_risco_id ON public.riscos_causas(risco_id);
CREATE INDEX idx_riscos_causas_categoria ON public.riscos_causas(categoria);
CREATE INDEX idx_riscos_causas_descricao ON public.riscos_causas USING gin(to_tsvector('portuguese', descricao));

-- Create trigger for updated_at
CREATE TRIGGER update_riscos_causas_updated_at
  BEFORE UPDATE ON public.riscos_causas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to analyze common causes
CREATE OR REPLACE FUNCTION public.analyze_common_causes()
RETURNS TABLE (
  causa_descricao TEXT,
  frequencia BIGINT,
  categorias TEXT[],
  riscos_alto_impacto BIGINT,
  riscos_medio_impacto BIGINT,
  riscos_baixo_impacto BIGINT,
  impacto_score NUMERIC
) 
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
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
    HAVING COUNT(*) > 1
  )
  SELECT 
    causa_descricao,
    frequencia,
    categorias,
    riscos_alto_impacto,
    riscos_medio_impacto,
    riscos_baixo_impacto,
    (riscos_alto_impacto * 3 + riscos_medio_impacto * 2 + riscos_baixo_impacto * 1)::NUMERIC / frequencia as impacto_score
  FROM causa_stats
  ORDER BY impacto_score DESC, frequencia DESC;
$$;