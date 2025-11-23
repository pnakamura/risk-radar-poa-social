import { Database } from '@/integrations/supabase/types';
import { 
  calculateAdvancedHealthScore, 
  calculateMitigationMetrics,
  MitigationMetrics,
  HealthScoreBreakdown
} from './riskHealthCalculations';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

export interface NarrativeAnalysis {
  executiveSummary: string;
  scoreExplanation: {
    label: string;
    description: string;
    implication: string;
    range: string;
  };
  criticalIssues: Array<{
    icon: string;
    severity: 'critical' | 'high' | 'medium';
    text: string;
  }>;
  strengths: Array<{
    icon: string;
    text: string;
  }>;
  recommendations: {
    urgent: string[];
    shortTerm: string[];
    mediumTerm: string[];
    continuous: string[];
  };
}

// Gera resumo executivo baseado no score e contexto
export const generateExecutiveSummary = (
  normalizedScore: number,
  totalRisks: number,
  projectName?: string
): string => {
  const projectContext = projectName ? `o projeto "${projectName}"` : 'o portfólio';
  
  if (totalRisks === 0) {
    return `${projectContext} ainda não possui riscos mapeados. Este é o momento ideal para iniciar uma análise sistemática de riscos que podem impactar seus objetivos estratégicos.`;
  }

  let condition = '';
  let context = '';

  if (normalizedScore >= 81) {
    condition = 'excelente';
    context = 'demonstrando maturidade organizacional na gestão de riscos. Os controles implementados são robustos e o monitoramento é proativo';
  } else if (normalizedScore >= 61) {
    condition = 'boa';
    context = 'com controles adequados estabelecidos. Existem oportunidades claras de melhoria que podem elevar significativamente a efetividade da gestão';
  } else if (normalizedScore >= 41) {
    condition = 'regular';
    context = 'sinalizando a necessidade de atenção em áreas críticas. Ações corretivas imediatas podem prevenir impactos adversos significativos';
  } else if (normalizedScore >= 21) {
    condition = 'preocupante';
    context = 'com deficiências significativas nos controles. É essencial priorizar ações de mitigação para reduzir a exposição aos riscos identificados';
  } else {
    condition = 'crítica';
    context = 'demandando intervenção urgente. A exposição atual representa ameaça severa aos objetivos e requer ação executiva imediata';
  }

  return `${projectContext} apresenta condição ${condition} (Score: ${normalizedScore}/100) com ${totalRisks} ${totalRisks === 1 ? 'risco mapeado' : 'riscos mapeados'}, ${context}.`;
};

// Explica o significado do score atual
export const explainHealthScore = (
  normalizedScore: number,
  breakdown: HealthScoreBreakdown
): {
  label: string;
  description: string;
  implication: string;
  range: string;
} => {
  if (normalizedScore >= 81) {
    return {
      label: 'Excelente',
      range: '81-100',
      description: 'A gestão de riscos demonstra maturidade excepcional com controles robustos, monitoramento proativo e alta efetividade nas ações implementadas.',
      implication: 'Continue mantendo este padrão de excelência, revisando periodicamente a eficácia dos controles e ajustando estratégias conforme necessário.'
    };
  } else if (normalizedScore >= 61) {
    return {
      label: 'Bom',
      range: '61-80',
      description: 'Os controles de risco são adequados e demonstram governança consistente, porém existem oportunidades identificadas para aumentar a efetividade da gestão.',
      implication: 'Foque em detalhar planos de mitigação, estabelecer cronogramas mais rigorosos e aprimorar a qualidade da documentação das ações.'
    };
  } else if (normalizedScore >= 41) {
    return {
      label: 'Regular',
      range: '41-60',
      description: 'A gestão apresenta controles básicos, mas há lacunas importantes que aumentam a exposição a riscos. Atenção imediata é necessária em áreas específicas.',
      implication: 'Priorize a atribuição de responsáveis, definição de prazos e detalhamento de ações para riscos de alta criticidade. A melhoria é viável com ações focadas.'
    };
  } else if (normalizedScore >= 21) {
    return {
      label: 'Ruim',
      range: '21-40',
      description: 'Existem deficiências significativas nos controles de risco. A exposição atual pode resultar em impactos adversos aos objetivos do projeto.',
      implication: 'Ação corretiva urgente é necessária. Estabeleça planos de mitigação detalhados, atribua responsabilidades claras e defina cronogramas rigorosos para riscos prioritários.'
    };
  } else {
    return {
      label: 'Crítico',
      range: '0-20',
      description: 'A situação é crítica com exposição severa a riscos. Controles são insuficientes ou inexistentes, representando ameaça grave aos objetivos.',
      implication: 'INTERVENÇÃO EXECUTIVA IMEDIATA NECESSÁRIA. Mobilize recursos, defina taskforce de resposta e implemente ações emergenciais nas próximas 24-48 horas.'
    };
  }
};

// Identifica pontos de atenção críticos
export const identifyCriticalIssues = (
  risks: Risk[],
  metrics: MitigationMetrics
): Array<{ icon: string; severity: 'critical' | 'high' | 'medium'; text: string }> => {
  const issues: Array<{ icon: string; severity: 'critical' | 'high' | 'medium'; text: string }> = [];

  // Riscos críticos sem ações detalhadas
  const criticalWithoutActions = risks.filter(r => 
    r.nivel_risco === 'Crítico' && (!r.acoes_mitigacao || r.acoes_mitigacao.length < 150)
  );
  
  if (criticalWithoutActions.length > 0) {
    issues.push({
      icon: '🚨',
      severity: 'critical',
      text: `${criticalWithoutActions.length} ${criticalWithoutActions.length === 1 ? 'risco crítico' : 'riscos críticos'} sem plano de mitigação detalhado (mínimo 150 caracteres)`
    });
  }

  // Riscos prioritários sem responsável
  const highPriorityUnassigned = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && !r.responsavel_id
  );

  if (highPriorityUnassigned.length > 0) {
    issues.push({
      icon: '👤',
      severity: 'critical',
      text: `${highPriorityUnassigned.length} ${highPriorityUnassigned.length === 1 ? 'risco prioritário' : 'riscos prioritários'} sem responsável atribuído`
    });
  }

  // Riscos sem prazo
  const priorityWithoutDeadline = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && !r.prazo
  );

  if (priorityWithoutDeadline.length > 0) {
    issues.push({
      icon: '⏰',
      severity: 'high',
      text: `${priorityWithoutDeadline.length} ${priorityWithoutDeadline.length === 1 ? 'risco' : 'riscos'} de alta prioridade sem prazo estabelecido`
    });
  }

  // Riscos estagnados (identificados há muito tempo)
  const stagnantRisks = risks.filter(r => {
    if (!r.data_identificacao || r.status !== 'Identificado') return false;
    const daysSince = Math.floor((Date.now() - new Date(r.data_identificacao).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 60;
  });

  if (stagnantRisks.length > 0) {
    issues.push({
      icon: '⚠️',
      severity: 'high',
      text: `${stagnantRisks.length} ${stagnantRisks.length === 1 ? 'risco identificado' : 'riscos identificados'} há mais de 60 dias sem progresso`
    });
  }

  // Estratégias passivas em riscos graves
  const passiveStrategy = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && r.estrategia === 'Aceitar'
  );

  if (passiveStrategy.length > 0) {
    issues.push({
      icon: '🛡️',
      severity: 'medium',
      text: `${passiveStrategy.length} ${passiveStrategy.length === 1 ? 'risco grave' : 'riscos graves'} com estratégia passiva ("Aceitar")`
    });
  }

  // Concentração de riscos por responsável
  const responsibleCount: { [key: string]: number } = {};
  risks.filter(r => r.responsavel_id && r.responsavel?.nome).forEach(r => {
    const key = r.responsavel!.nome;
    responsibleCount[key] = (responsibleCount[key] || 0) + 1;
  });

  const overloaded = Object.entries(responsibleCount).filter(([_, count]) => count > 7);
  if (overloaded.length > 0) {
    const names = overloaded.map(([name]) => name).join(', ');
    issues.push({
      icon: '⚖️',
      severity: 'medium',
      text: `${overloaded.length} ${overloaded.length === 1 ? 'responsável' : 'responsáveis'} com sobrecarga (>7 riscos): ${names}`
    });
  }

  // Eficiência de mitigação muito baixa
  if (metrics.mitigationEfficiency < 25 && risks.length > 3) {
    issues.push({
      icon: '📊',
      severity: 'high',
      text: `Eficiência de mitigação crítica (${Math.round(metrics.mitigationEfficiency)}%) - apenas ${metrics.risksInProgress + metrics.effectivelyMitigated} de ${risks.length} riscos em tratamento`
    });
  }

  return issues.slice(0, 6); // Limitar a 6 itens mais críticos
};

// Identifica forças e boas práticas
export const identifyStrengths = (
  risks: Risk[],
  metrics: MitigationMetrics
): Array<{ icon: string; text: string }> => {
  const strengths: Array<{ icon: string; text: string }> = [];

  if (risks.length === 0) {
    return [];
  }

  // Riscos efetivamente mitigados
  if (metrics.effectivelyMitigated > 0) {
    const percentage = Math.round((metrics.effectivelyMitigated / risks.length) * 100);
    strengths.push({
      icon: '✨',
      text: `${metrics.effectivelyMitigated} ${metrics.effectivelyMitigated === 1 ? 'risco efetivamente mitigado' : 'riscos efetivamente mitigados'} (${percentage}% do portfólio)`
    });
  }

  // Alta qualidade das ações
  if (metrics.actionQualityScore >= 0.7) {
    strengths.push({
      icon: '📝',
      text: `Alta qualidade dos planos de ação (score ${(metrics.actionQualityScore * 100).toFixed(0)}%) com documentação detalhada`
    });
  }

  // Todos os riscos com responsáveis
  const allAssigned = risks.filter(r => r.responsavel_id).length;
  if (allAssigned === risks.length && risks.length > 0) {
    strengths.push({
      icon: '🎯',
      text: `100% dos riscos atribuídos a responsáveis - clareza total de ownership`
    });
  } else if (allAssigned / risks.length >= 0.8) {
    const percentage = Math.round((allAssigned / risks.length) * 100);
    strengths.push({
      icon: '🎯',
      text: `${percentage}% dos riscos com responsáveis atribuídos`
    });
  }

  // Zero riscos críticos
  const criticalCount = risks.filter(r => r.nivel_risco === 'Crítico').length;
  if (criticalCount === 0 && risks.length > 0) {
    strengths.push({
      icon: '🛡️',
      text: 'Ausência de riscos em nível crítico - exposição controlada'
    });
  }

  // Alta eficiência de mitigação
  if (metrics.mitigationEfficiency >= 60) {
    strengths.push({
      icon: '⚡',
      text: `Excelente eficiência de mitigação (${Math.round(metrics.mitigationEfficiency)}%) - ${metrics.risksInProgress + metrics.effectivelyMitigated} riscos em tratamento ativo`
    });
  }

  // Monitoramento ativo
  const inMonitoring = risks.filter(r => r.status === 'Em Monitoramento').length;
  if (inMonitoring > 0 && inMonitoring / risks.length >= 0.3) {
    strengths.push({
      icon: '👁️',
      text: `${inMonitoring} ${inMonitoring === 1 ? 'risco' : 'riscos'} em monitoramento proativo contínuo`
    });
  }

  // Distribuição equilibrada de responsabilidades
  const responsibleCount: { [key: string]: number } = {};
  risks.filter(r => r.responsavel_id).forEach(r => {
    const key = r.responsavel_id!;
    responsibleCount[key] = (responsibleCount[key] || 0) + 1;
  });

  const maxLoad = Math.max(...Object.values(responsibleCount), 0);
  if (maxLoad > 0 && maxLoad <= 5 && Object.keys(responsibleCount).length > 1) {
    strengths.push({
      icon: '⚖️',
      text: `Carga bem distribuída entre ${Object.keys(responsibleCount).length} responsáveis (máx. ${maxLoad} riscos por pessoa)`
    });
  }

  return strengths.slice(0, 5); // Limitar a 5 forças
};

// Gera recomendações priorizadas
export const generatePrioritizedRecommendations = (
  risks: Risk[],
  criticalIssues: Array<{ icon: string; severity: string; text: string }>
): {
  urgent: string[];
  shortTerm: string[];
  mediumTerm: string[];
  continuous: string[];
} => {
  const recommendations = {
    urgent: [] as string[],
    shortTerm: [] as string[],
    mediumTerm: [] as string[],
    continuous: [] as string[]
  };

  if (risks.length === 0) {
    recommendations.urgent.push('Iniciar mapeamento sistemático de riscos que podem impactar os objetivos estratégicos');
    recommendations.shortTerm.push('Definir categorias de risco relevantes ao contexto do projeto');
    recommendations.mediumTerm.push('Estabelecer matriz de probabilidade e impacto alinhada aos objetivos');
    return recommendations;
  }

  // Urgentes (24-48h)
  const criticalUnassigned = risks.filter(r => r.nivel_risco === 'Crítico' && !r.responsavel_id);
  if (criticalUnassigned.length > 0) {
    recommendations.urgent.push(`Atribuir responsável imediato aos ${criticalUnassigned.length} riscos críticos desacompanhados`);
  }

  const criticalWithoutActions = risks.filter(r => 
    r.nivel_risco === 'Crítico' && (!r.acoes_mitigacao || r.acoes_mitigacao.length < 150)
  );
  if (criticalWithoutActions.length > 0) {
    const codes = criticalWithoutActions.slice(0, 3).map(r => r.codigo).join(', ');
    recommendations.urgent.push(`Detalhar planos de ação (mín. 300 caracteres) para riscos críticos: ${codes}${criticalWithoutActions.length > 3 ? ` e outros ${criticalWithoutActions.length - 3}` : ''}`);
  }

  const criticalWithoutDeadline = risks.filter(r => r.nivel_risco === 'Crítico' && !r.prazo);
  if (criticalWithoutDeadline.length > 0) {
    recommendations.urgent.push(`Estabelecer prazos de mitigação para ${criticalWithoutDeadline.length} riscos críticos`);
  }

  // Curto Prazo (esta semana)
  const highWithoutDeadline = risks.filter(r => r.nivel_risco === 'Alto' && !r.prazo);
  if (highWithoutDeadline.length > 0) {
    recommendations.shortTerm.push(`Definir cronograma de mitigação para ${highWithoutDeadline.length} riscos de alta prioridade`);
  }

  const readyToProgress = risks.filter(r => 
    r.status === 'Identificado' && r.acoes_mitigacao && r.acoes_mitigacao.length > 100 && r.responsavel_id
  );
  if (readyToProgress.length > 0) {
    recommendations.shortTerm.push(`Promover ${readyToProgress.length} riscos prontos de "Identificado" para "Em Andamento"`);
  }

  const lowQualityActions = risks.filter(r => 
    r.acoes_mitigacao && r.acoes_mitigacao.length > 0 && r.acoes_mitigacao.length < 100
  );
  if (lowQualityActions.length > 0) {
    recommendations.shortTerm.push(`Enriquecer documentação de ${lowQualityActions.length} riscos com ações superficiais`);
  }

  // Médio Prazo (este mês)
  const stagnant = risks.filter(r => {
    if (!r.data_identificacao || r.status !== 'Identificado') return false;
    const daysSince = Math.floor((Date.now() - new Date(r.data_identificacao).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 60;
  });
  if (stagnant.length > 0) {
    recommendations.mediumTerm.push(`Revisar relevância e atualizar status de ${stagnant.length} riscos estagnados (>60 dias)`);
  }

  const responsibleCount: { [key: string]: { nome: string; count: number } } = {};
  risks.filter(r => r.responsavel_id && r.responsavel?.nome).forEach(r => {
    const key = r.responsavel_id!;
    if (!responsibleCount[key]) {
      responsibleCount[key] = { nome: r.responsavel!.nome, count: 0 };
    }
    responsibleCount[key].count++;
  });

  const overloaded = Object.values(responsibleCount).filter(r => r.count > 7);
  if (overloaded.length > 0) {
    const names = overloaded.map(r => `${r.nome} (${r.count})`).join(', ');
    recommendations.mediumTerm.push(`Redistribuir carga dos responsáveis sobrecarregados: ${names}`);
  }

  const passiveStrategy = risks.filter(r => 
    (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && r.estrategia === 'Aceitar'
  );
  if (passiveStrategy.length > 0) {
    recommendations.mediumTerm.push(`Revisar estratégia de ${passiveStrategy.length} riscos graves com postura passiva`);
  }

  // Melhoria Contínua
  recommendations.continuous.push('Realizar revisões trimestrais de efetividade das estratégias de mitigação');
  recommendations.continuous.push('Manter documentação atualizada com lições aprendidas e boas práticas');
  recommendations.continuous.push('Monitorar indicadores de eficiência (KPIs) para ajustes proativos');

  if (risks.filter(r => r.status === 'Em Monitoramento').length > 0) {
    recommendations.continuous.push('Realizar reuniões mensais de acompanhamento dos riscos em monitoramento');
  }

  return {
    urgent: recommendations.urgent.slice(0, 3),
    shortTerm: recommendations.shortTerm.slice(0, 3),
    mediumTerm: recommendations.mediumTerm.slice(0, 3),
    continuous: recommendations.continuous.slice(0, 3)
  };
};

// Função principal que orquestra toda a análise narrativa
export const generateCompleteAnalysis = (
  risks: Risk[],
  projectName?: string
): NarrativeAnalysis => {
  const healthScore = calculateAdvancedHealthScore(risks);
  const metrics = calculateMitigationMetrics(risks);
  const normalizedScore = Math.round((healthScore.finalScore / 85) * 100);

  const executiveSummary = generateExecutiveSummary(normalizedScore, risks.length, projectName);
  const scoreExplanation = explainHealthScore(normalizedScore, healthScore);
  const criticalIssues = identifyCriticalIssues(risks, metrics);
  const strengths = identifyStrengths(risks, metrics);
  const recommendations = generatePrioritizedRecommendations(risks, criticalIssues);

  return {
    executiveSummary,
    scoreExplanation,
    criticalIssues,
    strengths,
    recommendations
  };
};
