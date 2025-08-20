// Fallback types when supabase types are not available
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          email: string;
          departamento: string | null;
          cargo: string | null;
          telefone: string | null;
          role: 'admin' | 'gestor' | 'analista' | 'consultor';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          email: string;
          departamento?: string | null;
          cargo?: string | null;
          telefone?: string | null;
          role: 'admin' | 'gestor' | 'analista' | 'consultor';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          departamento?: string | null;
          cargo?: string | null;
          telefone?: string | null;
          role?: 'admin' | 'gestor' | 'analista' | 'consultor';
          created_at?: string;
          updated_at?: string;
        };
      };
      riscos: {
        Row: {
          id: string;
          codigo: string;
          categoria: 'Estratégico' | 'Operacional' | 'Financeiro' | 'Conformidade' | 'Regulatório';
          descricao_risco: string;
          causas: string | null;
          consequencias: string | null;
          probabilidade: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          impacto: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          nivel_risco: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          estrategia: 'Aceitar' | 'Mitigar' | 'Transferir' | 'Evitar';
          acoes_mitigacao: string | null;
          acoes_contingencia: string | null;
          responsavel_id: string | null;
          prazo: string | null;
          status: 'Identificado' | 'Em Análise' | 'Em Tratamento' | 'Monitorado' | 'Encerrado';
          observacoes: string | null;
          data_identificacao: string;
          projeto_id: string | null;
          criado_por: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          categoria: 'Estratégico' | 'Operacional' | 'Financeiro' | 'Conformidade' | 'Regulatório';
          descricao_risco: string;
          causas?: string | null;
          consequencias?: string | null;
          probabilidade: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          impacto: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          nivel_risco: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          estrategia: 'Aceitar' | 'Mitigar' | 'Transferir' | 'Evitar';
          acoes_mitigacao?: string | null;
          acoes_contingencia?: string | null;
          responsavel_id?: string | null;
          prazo?: string | null;
          status: 'Identificado' | 'Em Análise' | 'Em Tratamento' | 'Monitorado' | 'Encerrado';
          observacoes?: string | null;
          data_identificacao: string;
          projeto_id?: string | null;
          criado_por: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          categoria?: 'Estratégico' | 'Operacional' | 'Financeiro' | 'Conformidade' | 'Regulatório';
          descricao_risco?: string;
          causas?: string | null;
          consequencias?: string | null;
          probabilidade?: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          impacto?: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          nivel_risco?: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
          estrategia?: 'Aceitar' | 'Mitigar' | 'Transferir' | 'Evitar';
          acoes_mitigacao?: string | null;
          acoes_contingencia?: string | null;
          responsavel_id?: string | null;
          prazo?: string | null;
          status?: 'Identificado' | 'Em Análise' | 'Em Tratamento' | 'Monitorado' | 'Encerrado';
          observacoes?: string | null;
          data_identificacao?: string;
          projeto_id?: string | null;
          criado_por?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projetos: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          gestor_id: string | null;
          data_inicio: string | null;
          data_fim: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          gestor_id?: string | null;
          data_inicio?: string | null;
          data_fim?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          gestor_id?: string | null;
          data_inicio?: string | null;
          data_fim?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      user_role: 'admin' | 'gestor' | 'analista' | 'consultor';
      risk_category: 'Estratégico' | 'Operacional' | 'Financeiro' | 'Conformidade' | 'Regulatório';
      risk_level: 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto' | 'Muito Alto';
      risk_status: 'Identificado' | 'Em Análise' | 'Em Tratamento' | 'Monitorado' | 'Encerrado';
      risk_strategy: 'Aceitar' | 'Mitigar' | 'Transferir' | 'Evitar';
    };
  };
};