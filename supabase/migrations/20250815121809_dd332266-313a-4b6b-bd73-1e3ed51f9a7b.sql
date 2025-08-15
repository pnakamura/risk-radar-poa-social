-- Adicionar política RLS para permitir que admins deletem projetos
CREATE POLICY "Admins podem deletar projetos" 
ON public.projetos 
FOR DELETE 
USING (is_admin_or_gestor(auth.uid()));