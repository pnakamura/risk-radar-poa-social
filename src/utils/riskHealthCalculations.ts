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

export interface CategoryHealthScore {
  category: string;
  risks: Risk[];
  healthScore: HealthScoreBreakdown;
  mitigationMetrics: MitigationMetrics;
  categoryWeight: number;
  benchmarkScore: number;
  insights: string[];
  trend: 'improving' | 'stable' | 'declining';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface CategoryBenchmarks {
  [category: string]: {
    target: number;
    good: number;
    acceptable: number;
    weight: number; // Peso estratégico da categoria
  };
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

// Gera sugestões proativas detalhadas baseadas nos dados
export const generateProactiveSuggestions = (risks: Risk[]): string[] => {
  const suggestions: string[] = [];
  const mitigationMetrics = calculateMitigationMetrics(risks);

  // Análise de criticidade urgente
  const criticalRisks = risks.filter(r => r.nivel_risco === 'Crítico');
  const criticalWithoutActions = criticalRisks.filter(r => 
    !r.acoes_mitigacao || r.acoes_mitigacao.length < 100
  ).length;

  if (criticalWithoutActions > 0) {
    suggestions.push(`🚨 ${criticalWithoutActions}/${criticalRisks.length} riscos críticos sem plano detalhado - Definir ações >300 caracteres`);
  }

  // Análise de atribuição crítica
  const unassignedCritical = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && !r.responsavel_id
  ).length;

  if (unassignedCritical > 0) {
    suggestions.push(`👤 ${unassignedCritical} riscos de alta prioridade sem responsável - Atribuir imediatamente`);
  }

  // Análise de prazos ausentes
  const highRisksWithoutDeadline = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && !r.prazo
  ).length;

  if (highRisksWithoutDeadline > 0) {
    suggestions.push(`⏰ ${highRisksWithoutDeadline} riscos críticos/altos sem prazo - Estabelecer cronograma`);
  }

  // Análise de eficiência de mitigação
  if (mitigationMetrics.mitigationEfficiency < 30) {
    suggestions.push(`📊 Eficiência de mitigação baixa (${Math.round(mitigationMetrics.mitigationEfficiency)}%) - Acelerar execução das ações planejadas`);
  }

  // Análise de qualidade das ações
  if (mitigationMetrics.actionQualityScore < 0.4) {
    const lowQualityCount = risks.filter(r => analyzeActionQuality(r) < 0.3).length;
    suggestions.push(`📝 ${lowQualityCount} riscos com ações superficiais - Detalhar responsável, prazo e estratégia`);
  }

  // Análise de progresso estagnado
  const stagnantRisks = risks.filter(r => 
    r.status === 'Identificado' && r.acoes_mitigacao && r.acoes_mitigacao.length > 100
  ).length;

  if (stagnantRisks > 0) {
    suggestions.push(`⚡ ${stagnantRisks} riscos prontos para execução - Promover status para "Em Andamento"`);
  }

  // Análise de estratégias passivas
  const passiveStrategy = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && r.estrategia === 'Aceitar'
  ).length;

  if (passiveStrategy > 0) {
    suggestions.push(`🛡️ ${passiveStrategy} riscos altos/críticos com estratégia passiva - Considerar mitigação ou transferência`);
  }

  // Análise de concentração de riscos por responsável
  const responsibleCount: { [key: string]: number } = {};
  risks.filter(r => r.responsavel_id).forEach(r => {
    const key = r.responsavel_id!;
    responsibleCount[key] = (responsibleCount[key] || 0) + 1;
  });

  const overloadedResponsible = Object.values(responsibleCount).filter(count => count > 5).length;
  if (overloadedResponsible > 0) {
    suggestions.push(`⚖️ ${overloadedResponsible} responsável(is) com >5 riscos - Redistribuir carga para melhor acompanhamento`);
  }

  // Sugestões específicas por categoria dominante
  const categoryDistribution: { [key: string]: number } = {};
  risks.forEach(r => {
    categoryDistribution[r.categoria] = (categoryDistribution[r.categoria] || 0) + 1;
  });

  const dominantCategory = Object.entries(categoryDistribution)
    .sort(([,a], [,b]) => b - a)[0];

  if (dominantCategory && dominantCategory[1] > risks.length * 0.4) {
    suggestions.push(`📊 Concentração alta em ${dominantCategory[0]} (${dominantCategory[1]} riscos) - Revisar controles desta categoria`);
  }

  // Análise temporal - riscos identificados há muito tempo
  const oldRisks = risks.filter(r => {
    if (!r.data_identificacao) return false;
    const daysSince = Math.floor((Date.now() - new Date(r.data_identificacao).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 60 && r.status === 'Identificado';
  }).length;

  if (oldRisks > 0) {
    suggestions.push(`📅 ${oldRisks} riscos identificados há >60 dias sem progresso - Revisar relevância ou acelerar tratamento`);
  }

  return suggestions.slice(0, 4); // Limitar a 4 sugestões mais relevantes
};

// Benchmarks por categoria baseados em padrões de mercado
export const getCategoryBenchmarks = (): CategoryBenchmarks => ({
  'Estratégico': { target: 75, good: 65, acceptable: 45, weight: 0.35 },
  'Operacional': { target: 70, good: 60, acceptable: 40, weight: 0.25 },
  'Financeiro': { target: 80, good: 70, acceptable: 50, weight: 0.20 },
  'Compliance': { target: 85, good: 75, acceptable: 55, weight: 0.15 },
  'Regulatório': { target: 85, good: 75, acceptable: 55, weight: 0.05 }
});

// Calcula health scores separados por categoria
export const calculateCategoryHealthScores = (risks: Risk[]): CategoryHealthScore[] => {
  const categories = [...new Set(risks.map(r => r.categoria))];
  const benchmarks = getCategoryBenchmarks();
  
  return categories.map(category => {
    const categoryRisks = risks.filter(r => r.categoria === category);
    const healthScore = calculateAdvancedHealthScore(categoryRisks);
    const mitigationMetrics = calculateMitigationMetrics(categoryRisks);
    const benchmark = benchmarks[category] || benchmarks['Operacional'];
    
    // Determinar prioridade baseada no score vs benchmark
    const priority = healthScore.finalScore < benchmark.acceptable ? 'critical' :
                    healthScore.finalScore < benchmark.good ? 'high' :
                    healthScore.finalScore < benchmark.target ? 'medium' : 'low';
    
    // Análise de tendência baseada na eficiência de mitigação e distribuição de riscos
    const criticalRatio = categoryRisks.filter(r => r.nivel_risco === 'Crítico').length / categoryRisks.length;
    const highRiskRatio = categoryRisks.filter(r => ['Crítico', 'Alto'].includes(r.nivel_risco)).length / categoryRisks.length;
    
    // Lógica corrigida: alta eficiência de mitigação = melhora, alta concentração de riscos críticos = deterioração
    const trend: CategoryHealthScore['trend'] = 
      criticalRatio > 0.4 || highRiskRatio > 0.6 ? 'declining' :  // Muitos riscos críticos/altos = deterioração
      mitigationMetrics.mitigationEfficiency > 70 && criticalRatio < 0.2 ? 'improving' :  // Alta eficiência + poucos críticos = melhora
      'stable';
    
    return {
      category,
      risks: categoryRisks,
      healthScore,
      mitigationMetrics,
      categoryWeight: benchmark.weight,
      benchmarkScore: benchmark.target,
      insights: generateCategoryInsights(category, categoryRisks, healthScore, mitigationMetrics),
      trend,
      priority: priority as CategoryHealthScore['priority']
    };
  }).sort((a, b) => b.categoryWeight - a.categoryWeight); // Ordenar por peso estratégico
};

// Gera insights específicos por categoria
export const generateCategoryInsights = (
  category: string,
  risks: Risk[],
  healthScore: HealthScoreBreakdown,
  mitigationMetrics: MitigationMetrics
): string[] => {
  const insights: string[] = [];
  const criticalCount = risks.filter(r => r.nivel_risco === 'Crítico').length;
  const unassignedCount = risks.filter(r => !r.responsavel_id).length;
  
  switch (category) {
    case 'Estratégico':
      if (criticalCount > 0) {
        insights.push(`${criticalCount} riscos estratégicos críticos demandam atenção executiva imediata`);
      }
      if (mitigationMetrics.mitigationEfficiency < 50) {
        insights.push('Riscos estratégicos requerem planos de contingência robustos');
      }
      if (healthScore.finalScore > 65) {
        insights.push('Governança estratégica demonstra maturidade organizacional');
      }
      break;
      
    case 'Operacional':
      if (unassignedCount > risks.length * 0.3) {
        insights.push('Definir responsabilidades operacionais claras para execução eficaz');
      }
      if (mitigationMetrics.risksInProgress > mitigationMetrics.effectivelyMitigated) {
        insights.push('Foco na conclusão das ações operacionais em andamento');
      }
      break;
      
    case 'Financeiro':
      if (criticalCount > 0) {
        insights.push('Riscos financeiros críticos podem impactar liquidez e rentabilidade');
      }
      if (mitigationMetrics.actionQualityScore < 0.6) {
        insights.push('Controles financeiros demandam detalhamento adicional');
      }
      break;
      
    case 'Compliance':
      if (healthScore.finalScore < 70) {
        insights.push('Não conformidade pode resultar em sanções regulatórias');
      }
      if (risks.filter(r => !r.prazo).length > 0) {
        insights.push('Estabelecer cronogramas rígidos para adequação normativa');
      }
      break;
      
    case 'Regulatório':
      if (criticalCount > 0) {
        insights.push('Riscos regulatórios críticos requerem monitoramento contínuo');
      }
      if (mitigationMetrics.effectivelyMitigated < risks.length * 0.5) {
        insights.push('Acelerar implementação de controles regulatórios');
      }
      break;
  }
  
  return insights.slice(0, 2);
};

// Calcula score geral ponderado baseado nas categorias
export const calculateWeightedOverallScore = (categoryScores: CategoryHealthScore[]): number => {
  if (categoryScores.length === 0) return 60;
  
  const totalWeight = categoryScores.reduce((sum, cat) => sum + cat.categoryWeight, 0);
  const weightedSum = categoryScores.reduce((sum, cat) => 
    sum + (cat.healthScore.finalScore * cat.categoryWeight), 0
  );
  
  return Math.round(weightedSum / totalWeight);
};