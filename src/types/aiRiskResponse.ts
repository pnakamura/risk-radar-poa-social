export interface AIRiskResponse {
  codigo: string;
  categoria: string;
  descricao_risco: string;
  causas: string;
  consequencias: string;
  probabilidade: string;
  impacto: string;
  nivel_risco: string;
  estrategia: string;
  acoes_mitigacao: string;
  acoes_contingencia: string;
  observacoes: string;
  status: "IA";
  analysis_confidence: number;
  recommendations: string[];
  missing_information: string[];
}

export interface AIWebhookResponse {
  success: boolean;
  data?: AIRiskResponse[];
  error?: string;
}