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
  onCategoryFilter?: (category: string, level?: string) => void;
}

export const RiskHealthScore = ({ risks, onCategoryFilter }: RiskHealthScoreProps) => {
  // Calcular métricas avançadas
  const healthScoreBreakdown = calculateAdvancedHealthScore(risks);
  const mitigationMetrics = calculateMitigationMetrics(risks);
  const suggestions = generateProactiveSuggestions(risks);
  
  // Calcular scores por categoria
  const categoryScores = calculateCategoryHealthScores(risks);
  const weightedOverallScore = calculateWeightedOverallScore(categoryScores);
  
  const healthScore = weightedOverallScore || healthScoreBreakdown.finalScore;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score >= 50) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Excelente';
    if (score >= 50) return 'Boa';
    return 'Requer Atenção Urgente';
  };

  const getBadges = () => {
    const badges = [];
    const assignedRisks = risks.filter(r => r.responsavel_id).length;
    
    // Badge por mitigação efetiva
    if (mitigationMetrics.effectivelyMitigated > 0) {
      badges.push({ 
        icon: CheckCircle2, 
        text: `${mitigationMetrics.effectivelyMitigated} Mitigados`, 
        color: 'bg-green-100 text-green-700' 
      });
    }
    
    // Badge por progresso em andamento
    if (mitigationMetrics.risksInProgress > 0) {
      badges.push({ 
        icon: Clock, 
        text: `${mitigationMetrics.risksInProgress} Em Execução`, 
        color: 'bg-yellow-100 text-yellow-700' 
      });
    }
    
    // Badge por qualidade das ações
    if (mitigationMetrics.actionQualityScore > 0.7) {
      badges.push({ 
        icon: Award, 
        text: 'Ações Detalhadas', 
        color: 'bg-blue-100 text-blue-700' 
      });
    }
    
    // Badge por atribuição completa
    if (assignedRisks === risks.length && risks.length > 0) {
      badges.push({ 
        icon: Target, 
        text: 'Todos Atribuídos', 
        color: 'bg-indigo-100 text-indigo-700' 
      });
    }

    // Badge por zero críticos
    if (risks.filter(r => r.nivel_risco === 'Crítico').length === 0 && risks.length > 0) {
      badges.push({ 
        icon: Award, 
        text: 'Zero Críticos', 
        color: 'bg-purple-100 text-purple-700' 
      });
    }

    // Badge por alta eficiência
    if (mitigationMetrics.mitigationEfficiency > 80) {
      badges.push({ 
        icon: Zap, 
        text: 'Alta Eficiência', 
        color: 'bg-emerald-100 text-emerald-700' 
      });
    }
    
    return badges;
  };

  return (
    <Card className={`border-2 ${getScoreColor(healthScore)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Risk Health Score</span>
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
              <div className="text-4xl font-bold mb-2">{healthScore}</div>
              <div className="text-sm font-medium text-muted-foreground mb-3">
                {getScoreLabel(healthScore)}
                {categoryScores.length > 1 && (
                  <span className="block text-xs text-muted-foreground">
                    Score Ponderado por {categoryScores.length} Categorias
                  </span>
                )}
              </div>
              <Progress value={healthScore} className="h-3" />
            </div>

            {/* Dashboard de Progresso da Mitigação */}
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <div className="font-semibold text-blue-600">{mitigationMetrics.risksWithActions}</div>
                <div className="text-xs text-muted-foreground">Ações Definidas</div>
              </div>
              <div>
                <div className="font-semibold text-yellow-600">{mitigationMetrics.risksInProgress}</div>
                <div className="text-xs text-muted-foreground">Em Execução</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">{mitigationMetrics.effectivelyMitigated}</div>
                <div className="text-xs text-muted-foreground">Mitigados</div>
              </div>
              <div>
                <div className="font-semibold text-purple-600">{Math.round(mitigationMetrics.mitigationEfficiency)}%</div>
                <div className="text-xs text-muted-foreground">Eficiência</div>
              </div>
            </div>

            {/* Métricas detalhadas */}
            <div className="grid grid-cols-2 gap-3 text-center text-sm border-t pt-3">
              <div>
                <div className="font-semibold">{risks.filter(r => r.responsavel_id).length}/{risks.length}</div>
                <div className="text-muted-foreground">Atribuídos</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(mitigationMetrics.actionQualityScore * 100)}%</div>
                <div className="text-muted-foreground">Qualidade</div>
              </div>
            </div>

            {/* Badges de conquistas */}
            {getBadges().length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getBadges().map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={index} variant="secondary" className={`text-xs ${badge.color}`}>
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
                    <div key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      💡 {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas gerais quando score bom */}
            {healthScore >= 70 && suggestions.length === 0 && (
              <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
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