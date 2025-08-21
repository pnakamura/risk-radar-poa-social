-- CORREÇÃO URGENTE: REMOVER RECURSÃO INFINITA NAS POLÍTICAS RLS

-- 1. REMOVER política problemática de projetos
DROP POLICY IF EXISTS "Usuários podem ver projetos por role" ON projetos;

-- 2. CRIAR política simplificada para projetos (sem dependência de riscos)
CREATE POLICY "Acesso a projetos por role" 
ON projetos FOR SELECT
USING (
  -- Admins e gestores veem todos os projetos
  is_admin_or_gestor(auth.uid()) OR
  -- Gestor do projeto pode ver seu projeto
  gestor_id = auth.uid() OR
  -- Qualquer usuário autenticado pode ver projetos (para listagem básica)
  auth.uid() IS NOT NULL
);

-- 3. SIMPLIFICAR política de riscos (remover dependência de projetos)
DROP POLICY IF EXISTS "Usuários podem ver riscos por role e projeto" ON riscos;

CREATE POLICY "Acesso a riscos por role e ownership"
ON riscos FOR SELECT 
USING (
  -- Admins e gestores veem todos os riscos
  is_admin_or_gestor(auth.uid()) OR
  -- Criador vê seus próprios riscos
  criado_por = auth.uid() OR
  -- Responsável vê riscos atribuídos a ele
  responsavel_id = auth.uid() OR
  -- Analistas veem riscos que criaram ou foram atribuídos
  (
    has_role(auth.uid(), 'analista'::user_role) AND 
    (criado_por = auth.uid() OR responsavel_id = auth.uid())
  )
);