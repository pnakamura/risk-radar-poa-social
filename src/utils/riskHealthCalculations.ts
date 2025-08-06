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

// Analisa a qualidade das ações de mitigação com critérios mais rigorosos
export const analyzeActionQuality = (risk: Risk): number => {
  const actionLength = risk.acoes_mitigacao?.length || 0;
  const hasResponsible = !!risk.responsavel_id;
  const hasDeadline = !!risk.prazo;
  const hasProactiveStrategy = risk.estrategia && risk.estrategia !== 'Aceitar';
  
  // Sistema de pontuação em níveis
  if (actionLength >= 500 && hasResponsible && hasDeadline && hasProactiveStrategy) {
    return 1.0; // Excelente
  } else if (actionLength >= 300 && hasResponsible && hasDeadline) {
    return 0.6; // Detalhado
  } else if (actionLength >= 150 && hasResponsible) {
    return 0.3; // Adequado
  } else if (actionLength >= 50) {
    return 0.1; // Básico
  }
  
  return 0; // Insuficiente
};

// Calcula o progresso de mitigação baseado no status com critérios mais realistas
export const calculateMitigationProgress = (risk: Risk): number => {
  switch (risk.status) {
    case 'Identificado': return 0;
    case 'Em Análise': return 0.1;
    case 'Em Andamento': return 0.4;
    case 'Em Monitoramento': return 0.7;
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

// Calcula o Health Score recalibrado com penalidades mais severas
export const calculateAdvancedHealthScore = (risks: Risk[]): HealthScoreBreakdown => {
  if (risks.length === 0) {
    return {
      baseScore: 60,
      riskLevelPenalty: 0,
      assignmentPenalty: 0,
      deadlinePenalty: 0,
      mitigationBonus: 0,
      finalScore: 60
    };
  }

  const totalRisks = risks.length;
  let baseScore = 60; // Score base mais baixo

  // Penalidades por nível de risco (pontos fixos por risco)
  const criticalRisks = risks.filter(r => r.nivel_risco === 'Crítico').length;
  const highRisks = risks.filter(r => r.nivel_risco === 'Alto').length;
  const mediumRisks = risks.filter(r => r.nivel_risco === 'Médio').length;
  const riskLevelPenalty = Math.round(
    (criticalRisks * 50 + highRisks * 30 + mediumRisks * 10) / totalRisks
  );

  // Penalidades mais severas por falta de atribuição
  const unassignedRisks = risks.filter(r => !r.responsavel_id).length;
  const assignmentPenalty = Math.round((unassignedRisks * 25) / totalRisks);

  // Penalidades mais severas por falta de prazo
  const risksWithoutDeadline = risks.filter(r => !r.prazo).length;
  const deadlinePenalty = Math.round((risksWithoutDeadline * 15) / totalRisks);

  // Penalidade adicional para riscos identificados há muito tempo
  const stagnantRisks = risks.filter(r => r.status === 'Identificado').length;
  const stagnationPenalty = Math.round((stagnantRisks * 10) / totalRisks);

  // Bônus mais conservadores por mitigação
  const mitigationMetrics = calculateMitigationMetrics(risks);
  let mitigationBonus = 0;

  // Bônus limitado por ações de qualidade (máximo 10 pontos)
  mitigationBonus += Math.min(10, mitigationMetrics.actionQualityScore * 10);

  // Bônus por progresso apenas se eficiência >50%
  if (mitigationMetrics.mitigationEfficiency > 50) {
    mitigationBonus += Math.round((mitigationMetrics.mitigationEfficiency / 100) * 15);
  }

  // Bônus por riscos efetivamente mitigados
  mitigationBonus += Math.round((mitigationMetrics.effectivelyMitigated / totalRisks) * 10);

  const finalScore = Math.max(0, Math.min(85, Math.round(
    baseScore - riskLevelPenalty - assignmentPenalty - deadlinePenalty - stagnationPenalty + mitigationBonus
  )));

  return {
    baseScore,
    riskLevelPenalty: riskLevelPenalty + assignmentPenalty + deadlinePenalty + stagnationPenalty,
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