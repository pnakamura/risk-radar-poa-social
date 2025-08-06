import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

export interface MitigationMetrics {
  risksWithActions: number;
  risksInProgress: number;
  effectivelyMitigated: number;
  mitigationEfficiency: number;
  actionQualityScore: number;
}

export interface HealthScoreBreakdown {
  baseScore: number;
  riskLevelPenalty: number;
  assignmentPenalty: number;
  deadlinePenalty: number;
  mitigationBonus: number;
  finalScore: number;
}

// Analisa a qualidade das ações de mitigação
export const analyzeActionQuality = (risk: Risk): number => {
  let qualityScore = 0;
  
  // Ações de mitigação detalhadas (peso: 0.4)
  if (risk.acoes_mitigacao) {
    if (risk.acoes_mitigacao.length > 100) qualityScore += 0.4;
    else if (risk.acoes_mitigacao.length > 50) qualityScore += 0.25;
    else if (risk.acoes_mitigacao.length > 20) qualityScore += 0.15;
  }
  
  // Ações de contingência (peso: 0.2)
  if (risk.acoes_contingencia && risk.acoes_contingencia.length > 50) {
    qualityScore += 0.2;
  }
  
  // Estratégia alinhada (peso: 0.2)
  if (risk.estrategia && risk.estrategia !== 'Aceitar') {
    qualityScore += 0.2;
  }
  
  // Responsável e prazo definidos (peso: 0.2)
  if (risk.responsavel_id && risk.prazo) {
    qualityScore += 0.2;
  }
  
  return Math.min(1, qualityScore);
};

// Calcula o progresso de mitigação baseado no status
export const calculateMitigationProgress = (risk: Risk): number => {
  switch (risk.status) {
    case 'Identificado': return 0.1;
    case 'Em Análise': return 0.2;
    case 'Em Andamento': return 0.5;
    case 'Em Monitoramento': return 0.8;
    case 'Mitigado': return 1.0;
    case 'Eliminado': return 1.0;
    default: return 0;
  }
};

// Calcula métricas de mitigação
export const calculateMitigationMetrics = (risks: Risk[]): MitigationMetrics => {
  if (risks.length === 0) {
    return {
      risksWithActions: 0,
      risksInProgress: 0,
      effectivelyMitigated: 0,
      mitigationEfficiency: 0,
      actionQualityScore: 0
    };
  }

  const risksWithActions = risks.filter(r => 
    r.acoes_mitigacao && r.acoes_mitigacao.length > 20
  ).length;

  const risksInProgress = risks.filter(r => 
    ['Em Andamento', 'Em Monitoramento'].includes(r.status)
  ).length;

  const effectivelyMitigated = risks.filter(r => 
    ['Mitigado', 'Eliminado'].includes(r.status)
  ).length;

  const totalActionQuality = risks.reduce((sum, risk) => 
    sum + analyzeActionQuality(risk), 0
  );

  const actionQualityScore = totalActionQuality / risks.length;

  const mitigationEfficiency = ((risksInProgress + effectivelyMitigated) / risks.length) * 100;

  return {
    risksWithActions,
    risksInProgress,
    effectivelyMitigated,
    mitigationEfficiency,
    actionQualityScore
  };
};

// Calcula o Health Score melhorado
export const calculateAdvancedHealthScore = (risks: Risk[]): HealthScoreBreakdown => {
  if (risks.length === 0) {
    return {
      baseScore: 85,
      riskLevelPenalty: 0,
      assignmentPenalty: 0,
      deadlinePenalty: 0,
      mitigationBonus: 0,
      finalScore: 85
    };
  }

  const totalRisks = risks.length;
  let baseScore = 100;

  // Penalidades por nível de risco
  const criticalRisks = risks.filter(r => r.nivel_risco === 'Crítico').length;
  const highRisks = risks.filter(r => r.nivel_risco === 'Alto').length;
  const riskLevelPenalty = (criticalRisks / totalRisks) * 40 + (highRisks / totalRisks) * 20;

  // Penalidades por falta de atribuição
  const unassignedRisks = risks.filter(r => !r.responsavel_id).length;
  const assignmentPenalty = (unassignedRisks / totalRisks) * 15;

  // Penalidades por falta de prazo
  const risksWithoutDeadline = risks.filter(r => !r.prazo).length;
  const deadlinePenalty = (risksWithoutDeadline / totalRisks) * 10;

  // Bônus por mitigação inteligente
  const mitigationMetrics = calculateMitigationMetrics(risks);
  let mitigationBonus = 0;

  // Bônus por ações de qualidade
  mitigationBonus += mitigationMetrics.actionQualityScore * 15;

  // Bônus por progresso no status
  mitigationBonus += (mitigationMetrics.mitigationEfficiency / 100) * 20;

  // Bônus por riscos efetivamente mitigados
  mitigationBonus += (mitigationMetrics.effectivelyMitigated / totalRisks) * 15;

  const finalScore = Math.max(0, Math.min(100, Math.round(
    baseScore - riskLevelPenalty - assignmentPenalty - deadlinePenalty + mitigationBonus
  )));

  return {
    baseScore,
    riskLevelPenalty,
    assignmentPenalty,
    deadlinePenalty,
    mitigationBonus,
    finalScore
  };
};

// Gera sugestões proativas baseadas nos dados
export const generateProactiveSuggestions = (risks: Risk[]): string[] => {
  const suggestions: string[] = [];
  const mitigationMetrics = calculateMitigationMetrics(risks);

  // Sugestões para ações de mitigação
  const risksWithoutActions = risks.filter(r => 
    !r.acoes_mitigacao || r.acoes_mitigacao.length < 20
  ).length;

  if (risksWithoutActions > 0) {
    suggestions.push(`${risksWithoutActions} riscos precisam de ações de mitigação detalhadas`);
  }

  // Sugestões para progresso de status
  const stagnantRisks = risks.filter(r => 
    r.status === 'Identificado' && r.acoes_mitigacao && r.acoes_mitigacao.length > 50
  ).length;

  if (stagnantRisks > 0) {
    suggestions.push(`${stagnantRisks} riscos podem ser promovidos para "Em Andamento"`);
  }

  // Sugestões para riscos críticos
  const criticalWithoutActions = risks.filter(r => 
    r.nivel_risco === 'Crítico' && (!r.acoes_mitigacao || r.acoes_mitigacao.length < 50)
  ).length;

  if (criticalWithoutActions > 0) {
    suggestions.push(`${criticalWithoutActions} riscos críticos precisam de ações urgentes`);
  }

  // Sugestões para atribuição
  const unassignedCritical = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && !r.responsavel_id
  ).length;

  if (unassignedCritical > 0) {
    suggestions.push(`${unassignedCritical} riscos de alta prioridade precisam de responsável`);
  }

  return suggestions;
};