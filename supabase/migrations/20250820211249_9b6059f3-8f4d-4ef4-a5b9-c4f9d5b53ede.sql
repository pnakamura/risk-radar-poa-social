-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA

-- 1. CORREÇÃO DAS POLÍTICAS RLS DA TABELA PROFILES
-- Remover a política permissiva atual e implementar controle rigoroso

-- Remover políticas existentes que são muito permissivas
DROP POLICY IF EXISTS "Todos podem ver perfis" ON public.profiles;

-- Criar política mais restritiva para visualização de perfis
-- Usuários só podem ver seu próprio perfil OU admins/gestores podem ver todos
CREATE POLICY "Usuários podem ver próprio perfil ou admins/gestores veem todos"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  is_admin_or_gestor(auth.uid())
);

-- 2. MELHORAR POLÍTICAS DE RISCOS
-- Adicionar política mais restritiva para criação de riscos
DROP POLICY IF EXISTS "Analistas podem criar riscos" ON public.riscos;

CREATE POLICY "Usuários autorizados podem criar riscos"
ON public.riscos
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (has_role(auth.uid(), 'admin'::user_role) OR 
   has_role(auth.uid(), 'gestor'::user_role) OR 
   has_role(auth.uid(), 'analista'::user_role)) AND
  criado_por = auth.uid()
);

-- 3. RESTRINGIR ACESSO AO HISTÓRICO DE RISCOS
-- Apenas usuários autenticados podem ver histórico
DROP POLICY IF EXISTS "Todos podem ver histórico" ON public.riscos_historico;

CREATE POLICY "Usuários autenticados podem ver histórico"
ON public.riscos_historico
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  (is_admin_or_gestor(auth.uid()) OR 
   auth.uid() IN (
     SELECT criado_por FROM public.riscos WHERE id = risco_id
   ))
);

-- 4. RESTRINGIR ACESSO AO HISTÓRICO DE VARIÁVEIS
DROP POLICY IF EXISTS "Todos podem ver histórico de variáveis" ON public.riscos_variaveis_historico;

CREATE POLICY "Usuários autenticados podem ver histórico de variáveis"
ON public.riscos_variaveis_historico
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  (is_admin_or_gestor(auth.uid()) OR 
   auth.uid() IN (
     SELECT criado_por FROM public.riscos WHERE id = risco_id
   ))
);

-- 5. MELHORAR SEGURANÇA DAS CAUSAS DE RISCOS
DROP POLICY IF EXISTS "Todos podem ver causas dos riscos" ON public.riscos_causas;

CREATE POLICY "Usuários autenticados podem ver causas"
ON public.riscos_causas
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND
  (is_admin_or_gestor(auth.uid()) OR 
   auth.uid() IN (
     SELECT criado_por FROM public.riscos WHERE id = risco_id
   ))
);

-- 6. FUNÇÃO DE SEGURANÇA ADICIONAL PARA VERIFICAR ACESSO A RISCOS
CREATE OR REPLACE FUNCTION public.user_can_access_risk(_user_id uuid, _risco_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.riscos 
    WHERE id = _risco_id AND 
    (criado_por = _user_id OR 
     is_admin_or_gestor(_user_id))
  )
$$;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE DE SEGURANÇA
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_riscos_criado_por ON public.riscos(criado_por);
CREATE INDEX IF NOT EXISTS idx_riscos_historico_risco_usuario ON public.riscos_historico(risco_id, usuario_id);

-- 8. ADICIONAR CONSTRAINT PARA GARANTIR QUE CRIADO_POR NÃO SEJA NULL
ALTER TABLE public.riscos ALTER COLUMN criado_por SET NOT NULL;