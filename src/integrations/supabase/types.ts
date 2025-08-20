export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          departamento: string | null
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          departamento?: string | null
          email: string
          id: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          departamento?: string | null
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          gestor_id: string | null
          id: string
          nome: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          gestor_id?: string | null
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          gestor_id?: string | null
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos: {
        Row: {
          acoes_contingencia: string | null
          acoes_mitigacao: string | null
          categoria: Database["public"]["Enums"]["risk_category"]
          causas: string | null
          codigo: string
          consequencias: string | null
          created_at: string
          criado_por: string
          data_identificacao: string
          descricao_risco: string
          estrategia: Database["public"]["Enums"]["risk_strategy"]
          id: string
          impacto: Database["public"]["Enums"]["risk_impact"]
          nivel_risco: Database["public"]["Enums"]["risk_level"]
          observacoes: string | null
          prazo: string | null
          probabilidade: Database["public"]["Enums"]["risk_probability"]
          projeto_id: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["risk_status"]
          updated_at: string
        }
        Insert: {
          acoes_contingencia?: string | null
          acoes_mitigacao?: string | null
          categoria: Database["public"]["Enums"]["risk_category"]
          causas?: string | null
          codigo: string
          consequencias?: string | null
          created_at?: string
          criado_por: string
          data_identificacao?: string
          descricao_risco: string
          estrategia: Database["public"]["Enums"]["risk_strategy"]
          id?: string
          impacto: Database["public"]["Enums"]["risk_impact"]
          nivel_risco: Database["public"]["Enums"]["risk_level"]
          observacoes?: string | null
          prazo?: string | null
          probabilidade: Database["public"]["Enums"]["risk_probability"]
          projeto_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          updated_at?: string
        }
        Update: {
          acoes_contingencia?: string | null
          acoes_mitigacao?: string | null
          categoria?: Database["public"]["Enums"]["risk_category"]
          causas?: string | null
          codigo?: string
          consequencias?: string | null
          created_at?: string
          criado_por?: string
          data_identificacao?: string
          descricao_risco?: string
          estrategia?: Database["public"]["Enums"]["risk_strategy"]
          id?: string
          impacto?: Database["public"]["Enums"]["risk_impact"]
          nivel_risco?: Database["public"]["Enums"]["risk_level"]
          observacoes?: string | null
          prazo?: string | null
          probabilidade?: Database["public"]["Enums"]["risk_probability"]
          projeto_id?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "riscos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_causas: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string
          id: string
          risco_id: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao: string
          id?: string
          risco_id: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string
          id?: string
          risco_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "riscos_causas_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "riscos"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_historico: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          observacoes: string | null
          risco_id: string
          usuario_id: string
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          observacoes?: string | null
          risco_id: string
          usuario_id: string
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          observacoes?: string | null
          risco_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "riscos_historico_risco_id_fkey"
            columns: ["risco_id"]
            isOneToOne: false
            referencedRelation: "riscos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riscos_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_variaveis_historico: {
        Row: {
          created_at: string
          data_snapshot: string
          id: string
          impacto: Database["public"]["Enums"]["risk_impact"]
          nivel_risco: Database["public"]["Enums"]["risk_level"]
          observacoes: string | null
          probabilidade: Database["public"]["Enums"]["risk_probability"]
          risco_id: string
          status: Database["public"]["Enums"]["risk_status"]
          usuario_id: string
        }
        Insert: {
          created_at?: string
          data_snapshot?: string
          id?: string
          impacto: Database["public"]["Enums"]["risk_impact"]
          nivel_risco: Database["public"]["Enums"]["risk_level"]
          observacoes?: string | null
          probabilidade: Database["public"]["Enums"]["risk_probability"]
          risco_id: string
          status: Database["public"]["Enums"]["risk_status"]
          usuario_id: string
        }
        Update: {
          created_at?: string
          data_snapshot?: string
          id?: string
          impacto?: Database["public"]["Enums"]["risk_impact"]
          nivel_risco?: Database["public"]["Enums"]["risk_level"]
          observacoes?: string | null
          probabilidade?: Database["public"]["Enums"]["risk_probability"]
          risco_id?: string
          status?: Database["public"]["Enums"]["risk_status"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "riscos_variaveis_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_common_causes: {
        Args: Record<PropertyKey, never>
        Returns: {
          categorias: string[]
          causa_descricao: string
          complexidade_score: number
          confiabilidade_score: number
          criticidade_score: number
          frequencia: number
          impacto_score: number
          riscos_alto_impacto: number
          riscos_baixo_impacto: number
          riscos_medio_impacto: number
          score_final: number
          tendencia_score: number
        }[]
      }
      analyze_common_causes_enhanced: {
        Args: Record<PropertyKey, never>
        Returns: {
          categorias: string[]
          causa_descricao: string
          complexidade_score: number
          confiabilidade_score: number
          criticidade_score: number
          frequencia: number
          impacto_score: number
          riscos_afetados: string[]
          riscos_alto_impacto: number
          riscos_baixo_impacto: number
          riscos_medio_impacto: number
          score_final: number
          tendencia_score: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_gestor: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_can_access_risk: {
        Args: { _risco_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      risk_category:
        | "Tecnologia"
        | "Recursos Humanos"
        | "Financeiro"
        | "Operacional"
        | "Compliance"
        | "Estratégico"
        | "Regulatório"
      risk_impact: "Muito Baixo" | "Baixo" | "Médio" | "Alto" | "Muito Alto"
      risk_level: "Baixo" | "Médio" | "Alto" | "Crítico"
      risk_probability:
        | "Muito Baixa"
        | "Baixa"
        | "Média"
        | "Alta"
        | "Muito Alta"
      risk_status:
        | "Identificado"
        | "Em Análise"
        | "Em Monitoramento"
        | "Em Andamento"
        | "Mitigado"
        | "Aceito"
        | "Transferido"
        | "Eliminado"
      risk_strategy: "Mitigar" | "Aceitar" | "Transferir" | "Evitar"
      user_role: "admin" | "gestor" | "analista" | "visualizador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      risk_category: [
        "Tecnologia",
        "Recursos Humanos",
        "Financeiro",
        "Operacional",
        "Compliance",
        "Estratégico",
        "Regulatório",
      ],
      risk_impact: ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"],
      risk_level: ["Baixo", "Médio", "Alto", "Crítico"],
      risk_probability: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
      risk_status: [
        "Identificado",
        "Em Análise",
        "Em Monitoramento",
        "Em Andamento",
        "Mitigado",
        "Aceito",
        "Transferido",
        "Eliminado",
      ],
      risk_strategy: ["Mitigar", "Aceitar", "Transferir", "Evitar"],
      user_role: ["admin", "gestor", "analista", "visualizador"],
    },
  },
} as const
