
-- Criar ENUMs para padronizar valores
CREATE TYPE public.risk_category AS ENUM (
  'Tecnologia',
  'Recursos Humanos', 
  'Financeiro',
  'Operacional',
  'Compliance',
  'Estratégico',
  'Regulatório'
);

CREATE TYPE public.risk_level AS ENUM ('Baixo', 'Médio', 'Alto', 'Crítico');
CREATE TYPE public.risk_probability AS ENUM ('Muito Baixa', 'Baixa', 'Média', 'Alta', 'Muito Alta');
CREATE TYPE public.risk_impact AS ENUM ('Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto');
CREATE TYPE public.risk_status AS ENUM ('Identificado', 'Em Análise', 'Em Monitoramento', 'Em Andamento', 'Mitigado', 'Aceito', 'Transferido', 'Eliminado');
CREATE TYPE public.risk_strategy AS ENUM ('Mitigar', 'Aceitar', 'Transferir', 'Evitar');
CREATE TYPE public.user_role AS ENUM ('admin', 'gestor', 'analista', 'visualizador');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  departamento TEXT,
  cargo TEXT,
  telefone TEXT,
  role user_role NOT NULL DEFAULT 'visualizador',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabela de projetos
CREATE TABLE public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  gestor_id UUID REFERENCES public.profiles(id),
  data_inicio DATE,
  data_fim DATE,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabela principal de riscos
CREATE TABLE public.riscos (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  categoria risk_category NOT NULL,
  descricao_risco TEXT NOT NULL,
  causas TEXT,
  consequencias TEXT,
  probabilidade risk_probability NOT NULL,
  impacto risk_impact NOT NULL,
  nivel_risco risk_level NOT NULL,
  estrategia risk_strategy NOT NULL,
  acoes_mitigacao TEXT,
  acoes_contingencia TEXT,
  responsavel_id UUID REFERENCES public.profiles(id),
  prazo DATE,
  status risk_status NOT NULL DEFAULT 'Identificado',
  observacoes TEXT,
  data_identificacao DATE NOT NULL DEFAULT CURRENT_DATE,
  projeto_id UUID REFERENCES public.projetos(id),
  criado_por UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Tabela de histórico/auditoria
CREATE TABLE public.riscos_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  risco_id UUID NOT NULL REFERENCES public.riscos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id),
  acao TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  dados_anteriores JSONB,
  dados_novos JSONB,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riscos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riscos_historico ENABLE ROW LEVEL SECURITY;

-- Função para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- Função para verificar se é admin ou gestor
CREATE OR REPLACE FUNCTION public.is_admin_or_gestor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role IN ('admin', 'gestor')
  )
$$;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins e gestores podem ver todos os perfis" ON public.profiles
  FOR SELECT USING (public.is_admin_or_gestor(auth.uid()));

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem gerenciar todos os perfis" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para projetos
CREATE POLICY "Todos podem ver projetos" ON public.projetos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins e gestores podem criar projetos" ON public.projetos
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_gestor(auth.uid()));

CREATE POLICY "Admins e gestores podem editar projetos" ON public.projetos
  FOR UPDATE TO authenticated USING (public.is_admin_or_gestor(auth.uid()));

-- Políticas RLS para riscos
CREATE POLICY "Todos podem ver riscos" ON public.riscos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Analistas podem criar riscos" ON public.riscos
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gestor') OR 
    public.has_role(auth.uid(), 'analista')
  );

CREATE POLICY "Criadores e gestores podem editar riscos" ON public.riscos
  FOR UPDATE TO authenticated USING (
    criado_por = auth.uid() OR 
    public.is_admin_or_gestor(auth.uid())
  );

CREATE POLICY "Admins podem deletar riscos" ON public.riscos
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para histórico
CREATE POLICY "Todos podem ver histórico" ON public.riscos_historico
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sistema pode inserir histórico" ON public.riscos_historico
  FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    'visualizador'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger para auditoria automática
CREATE OR REPLACE FUNCTION public.audit_riscos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.riscos_historico (risco_id, usuario_id, acao, dados_novos)
    VALUES (NEW.id, auth.uid(), 'CREATE', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.riscos_historico (risco_id, usuario_id, acao, dados_anteriores, dados_novos)
    VALUES (NEW.id, auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.riscos_historico (risco_id, usuario_id, acao, dados_anteriores)
    VALUES (OLD.id, auth.uid(), 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER riscos_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.riscos
  FOR EACH ROW EXECUTE PROCEDURE public.audit_riscos();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at 
  BEFORE UPDATE ON public.projetos 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_riscos_updated_at 
  BEFORE UPDATE ON public.riscos 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Inserir dados iniciais (projetos padrão)
INSERT INTO public.projetos (nome, descricao, status) VALUES
('POA Digital', 'Programa de digitalização dos serviços municipais', 'Ativo'),
('POA Social', 'Programa de assistência social', 'Ativo'),
('POA+SOCIAL', 'Expansão do programa social', 'Ativo');
