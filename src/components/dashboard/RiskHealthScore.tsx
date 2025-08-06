import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Award, Target, AlertTriangle, CheckCircle2, Clock, Zap, BarChart3, Layers } from 'lucide-react';
import { FieldHelpButton } from '@/components/risk-management/help/FieldHelpButton';
import { helpContent } from '@/components/risk-management/help/helpContent';
import { CategoryHealthCard } from './CategoryHealthCard';
import { CategoryRadarChart } from './CategoryRadarChart';
import { CategoryHeatmap } from './CategoryHeatmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database } from '@/integrations/supabase/types';
import { 
  calculateAdvancedHealthScore, 
  calculateMitigationMetrics, 
  generateProactiveSuggestions,
  calculateCategoryHealthScores,
  calculateWeightedOverallScore
} from '@/utils/riskHealthCalculations';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskHealthScoreProps {
  risks: Risk[];
  selectedProject?: string;
  onCategoryFilter?: (category: string, level?: string) => void;
}

export const RiskHealthScore = ({ risks, selectedProject, onCategoryFilter }: RiskHealthScoreProps) => {
  // Filtrar riscos por projeto se selecionado
  const filteredRisks = selectedProject 
    ? risks.filter(risk => risk.projeto?.nome === selectedProject)
    : risks;

  // Calcular métricas avançadas
  const healthScoreBreakdown = calculateAdvancedHealthScore(filteredRisks);
  const mitigationMetrics = calculateMitigationMetrics(filteredRisks);
  const suggestions = generateProactiveSuggestions(filteredRisks);
  
  // Calcular scores por categoria
  const categoryScores = calculateCategoryHealthScores(filteredRisks);
  const weightedOverallScore = calculateWeightedOverallScore(categoryScores);
  
  const healthScore = weightedOverallScore || healthScoreBreakdown.finalScore;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-risk-excellent bg-risk-excellent-bg border-risk-excellent-border shadow-lg shadow-risk-excellent/20';
    if (score >= 50) return 'text-risk-good bg-risk-good-bg border-risk-good-border shadow-lg shadow-risk-good/20';
    return 'text-risk-critical bg-risk-critical-bg border-risk-critical-border shadow-lg shadow-risk-critical/20';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-5 h-5 text-risk-excellent animate-pulse" />;
    if (score >= 50) return <Minus className="w-5 h-5 text-risk-good" />;
    return <TrendingDown className="w-5 h-5 text-risk-critical animate-bounce" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Excelente';
    if (score >= 50) return 'Boa';
    return 'Requer Atenção Urgente';
  };

  const getBadges = () => {
    const badges = [];
    const assignedRisks = filteredRisks.filter(r => r.responsavel_id).length;
    
    // Badge por mitigação efetiva
    if (mitigationMetrics.effectivelyMitigated > 0) {
      badges.push({ 
        icon: CheckCircle2, 
        text: `${mitigationMetrics.effectivelyMitigated} Mitigados`, 
        color: 'bg-risk-excellent-bg text-risk-excellent border-risk-excellent-border' 
      });
    }
    
    // Badge por progresso em andamento
    if (mitigationMetrics.risksInProgress > 0) {
      badges.push({ 
        icon: Clock, 
        text: `${mitigationMetrics.risksInProgress} Em Execução`, 
        color: 'bg-risk-warning-bg text-risk-warning border-risk-warning-border' 
      });
    }
    
    // Badge por qualidade das ações
    if (mitigationMetrics.actionQualityScore > 0.7) {
      badges.push({ 
        icon: Award, 
        text: 'Ações Detalhadas', 
        color: 'bg-category-compliance-bg text-category-compliance border-category-compliance/20' 
      });
    }
    
    // Badge por atribuição completa
    if (assignedRisks === filteredRisks.length && filteredRisks.length > 0) {
      badges.push({ 
        icon: Target, 
        text: 'Todos Atribuídos', 
        color: 'bg-category-strategic-bg text-category-strategic border-category-strategic/20' 
      });
    }

    // Badge por zero críticos
    if (filteredRisks.filter(r => r.nivel_risco === 'Crítico').length === 0 && filteredRisks.length > 0) {
      badges.push({ 
        icon: Award, 
        text: 'Zero Críticos', 
        color: 'bg-category-operational-bg text-category-operational border-category-operational/20' 
      });
    }

    // Badge por alta eficiência
    if (mitigationMetrics.mitigationEfficiency > 80) {
      badges.push({ 
        icon: Zap, 
        text: 'Alta Eficiência', 
        color: 'bg-category-financial-bg text-category-financial border-category-financial/20 animate-pulse' 
      });
    }
    
    return badges;
  };

  return (
    <Card className={`border-2 transition-all duration-300 hover-lift ${getScoreColor(healthScore)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Risk Health Score</span>
            {selectedProject && (
              <Badge variant="outline" className="text-xs">
                Projeto: {selectedProject}
              </Badge>
            )}
            <FieldHelpButton 
              field="risk_health_score" 
              content={helpContent.risk_health_score}
            />
          </div>
          {getScoreIcon(healthScore)}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs">
              <Layers className="w-3 h-3 mr-1" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="radar" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Radar
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Score principal */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 animate-fade-in">{healthScore}</div>
              <div className="text-sm font-medium text-muted-foreground mb-3">
                {getScoreLabel(healthScore)}
                {categoryScores.length > 1 && (
                  <span className="block text-xs text-muted-foreground">
                    Score Ponderado por {categoryScores.length} Categorias
                  </span>
                )}
                {selectedProject && (
                  <span className="block text-xs text-primary font-medium">
                    Filtrado para {filteredRisks.length} riscos
                  </span>
                )}
              </div>
              <Progress value={healthScore} className="h-3 transition-all duration-500" />
            </div>

            {/* Dashboard de Progresso da Mitigação */}
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="p-2 rounded-lg bg-category-compliance-bg/50 transition-all duration-200 hover:scale-105">
                <div className="font-semibold text-category-compliance">{mitigationMetrics.risksWithActions}</div>
                <div className="text-xs text-muted-foreground">Ações Definidas</div>
              </div>
              <div className="p-2 rounded-lg bg-risk-warning-bg/50 transition-all duration-200 hover:scale-105">
                <div className="font-semibold text-risk-warning">{mitigationMetrics.risksInProgress}</div>
                <div className="text-xs text-muted-foreground">Em Execução</div>
              </div>
              <div className="p-2 rounded-lg bg-risk-excellent-bg/50 transition-all duration-200 hover:scale-105">
                <div className="font-semibold text-risk-excellent">{mitigationMetrics.effectivelyMitigated}</div>
                <div className="text-xs text-muted-foreground">Mitigados</div>
              </div>
              <div className="p-2 rounded-lg bg-category-financial-bg/50 transition-all duration-200 hover:scale-105">
                <div className="font-semibold text-category-financial">{Math.round(mitigationMetrics.mitigationEfficiency)}%</div>
                <div className="text-xs text-muted-foreground">Eficiência</div>
              </div>
            </div>

            {/* Métricas detalhadas */}
            <div className="grid grid-cols-2 gap-3 text-center text-sm border-t pt-3">
              <div className="p-2 rounded-lg bg-category-strategic-bg/30">
                <div className="font-semibold text-category-strategic">{filteredRisks.filter(r => r.responsavel_id).length}/{filteredRisks.length}</div>
                <div className="text-muted-foreground">Atribuídos</div>
              </div>
              <div className="p-2 rounded-lg bg-category-operational-bg/30">
                <div className="font-semibold text-category-operational">{Math.round(mitigationMetrics.actionQualityScore * 100)}%</div>
                <div className="text-muted-foreground">Qualidade</div>
              </div>
            </div>

            {/* Badges de conquistas */}
            {getBadges().length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getBadges().map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={index} variant="secondary" className={`text-xs border transition-all duration-200 hover:scale-105 ${badge.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {badge.text}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Alertas Proativos e Sugestões */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <AlertTriangle className="w-3 h-3" />
                  Sugestões de Melhoria
                </div>
                <div className="space-y-1">
                  {suggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded transition-all duration-200 hover:bg-muted/70">
                      💡 {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas gerais quando score bom */}
            {healthScore >= 70 && suggestions.length === 0 && (
              <div className="text-xs text-risk-excellent bg-risk-excellent-bg p-2 rounded border border-risk-excellent-border animate-pulse">
                🎉 Excelente gestão de riscos! Continue monitorando e atualizando.
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryScores.map((categoryScore) => (
                <CategoryHealthCard
                  key={categoryScore.category}
                  categoryScore={categoryScore}
                  onCategoryClick={(category) => onCategoryFilter?.(category)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="radar" className="mt-4">
            <CategoryRadarChart categoryScores={categoryScores} />
          </TabsContent>

          <TabsContent value="heatmap" className="mt-4">
            <CategoryHeatmap 
              categoryScores={categoryScores}
              onCellClick={(category, level) => onCategoryFilter?.(category, level)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};