-- FASE 1.3: CORREÇÃO CRÍTICA - POLÍTICAS RLS EXPOSTAS

-- 1. REMOVER políticas que permitem acesso amplo demais aos riscos
DROP POLICY IF EXISTS "Todos podem ver riscos" ON riscos;

-- 2. REMOVER políticas que permitem acesso amplo demais aos projetos  
DROP POLICY IF EXISTS "Todos podem ver projetos" ON projetos;

-- 3. IMPLEMENTAR políticas baseadas em roles e ownership para riscos
CREATE POLICY "Usuários podem ver riscos por role e projeto" 
ON riscos FOR SELECT 
USING (
  -- Admins e gestores veem tudo
  is_admin_or_gestor(auth.uid()) OR
  -- Criadores veem seus próprios riscos
  criado_por = auth.uid() OR
  -- Responsáveis veem riscos atribuídos a eles
  responsavel_id = auth.uid() OR
  -- Analistas veem riscos de projetos onde há participação
  (
    has_role(auth.uid(), 'analista'::user_role) AND 
    EXISTS (
      SELECT 1 FROM projetos p 
      WHERE p.id = projeto_id 
      AND (p.gestor_id = auth.uid() OR is_admin_or_gestor(auth.uid()))
    )
  )
);

-- 4. IMPLEMENTAR políticas baseadas em roles para projetos
CREATE POLICY "Usuários podem ver projetos por role"
ON projetos FOR SELECT
USING (
  -- Admins e gestores veem todos projetos
  is_admin_or_gestor(auth.uid()) OR
  -- Gestores específicos veem seus projetos
  gestor_id = auth.uid() OR
  -- Analistas veem projetos onde participam de riscos
  (
    has_role(auth.uid(), 'analista'::user_role) AND
    EXISTS (
      SELECT 1 FROM riscos r 
      WHERE r.projeto_id = id 
      AND (r.criado_por = auth.uid() OR r.responsavel_id = auth.uid())
    )
  )
);

-- 5. LIMPAR políticas duplicadas em profiles (manter apenas as necessárias)
DROP POLICY IF EXISTS "Admins e gestores podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil ou admins/gestores veem tod" ON profiles;

-- 6. CRIAR política consolidada para profiles
CREATE POLICY "Acesso controlado a perfis por role"
ON profiles FOR SELECT
USING (
  -- Usuário vê próprio perfil
  auth.uid() = id OR
  -- Admins veem todos os perfis
  has_role(auth.uid(), 'admin'::user_role) OR
  -- Gestores veem perfis de analistas em seus projetos
  (
    has_role(auth.uid(), 'gestor'::user_role) AND
    (
      has_role(id, 'analista'::user_role) OR 
      has_role(id, 'visualizador'::user_role)
    )
  )
);