import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Minus, Award, Target, AlertTriangle, CheckCircle2, Clock, Zap, BarChart3, Layers } from 'lucide-react';
import { FieldHelpButton } from '@/components/risk-management/help/FieldHelpButton';
import { helpContent } from '@/components/risk-management/help/helpContent';
import { CategoryHealthCard } from './CategoryHealthCard';
import { CategoryRadarChart } from './CategoryRadarChart';
import { CategoryHeatmap } from './CategoryHeatmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Database } from '@/integrations/supabase/types';
import { 
  calculateAdvancedHealthScore, 
  calculateMitigationMetrics, 
  generateProactiveSuggestions,
  calculateCategoryHealthScores,
  calculateWeightedOverallScore
} from '@/utils/riskHealthCalculations';
import { 
  normalizeScore, 
  getSemanticScoreColor, 
  getScoreLabel, 
  getScoreTrendIcon 
} from '@/utils/scoreNormalization';

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
  const isMobile = useIsMobile();

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
  
  const rawHealthScore = weightedOverallScore || healthScoreBreakdown.finalScore;
  const normalizedHealthScore = normalizeScore(rawHealthScore);
  
  const getScoreIcon = (normalizedScore: number) => {
    if (normalizedScore >= 81) return <TrendingUp className="w-5 h-5 text-risk-excellent animate-pulse" />;
    if (normalizedScore >= 61) return <Minus className="w-5 h-5 text-risk-good" />;
    if (normalizedScore >= 41) return <TrendingDown className="w-5 h-5 text-risk-warning" />;
    return <TrendingDown className="w-5 h-5 text-risk-critical animate-bounce" />;
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
    <Card className={`border-2 transition-all duration-300 hover-lift ${getSemanticScoreColor(normalizedHealthScore)}`}>
      <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-3' : ''}`}>
        <CardTitle className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 ${isMobile ? 'flex-col text-center' : ''}`}>
            <span className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>Risk Health Score</span>
            {selectedProject && (
              <Badge variant="outline" className={`text-xs ${isMobile ? 'px-2 py-1' : ''}`}>
                Projeto: {selectedProject}
              </Badge>
            )}
            {!isMobile && (
              <FieldHelpButton 
                field="risk_health_score" 
                content={helpContent.risk_health_score}
              />
            )}
          </div>
          <div className={`flex items-center gap-2 ${isMobile ? 'flex-col' : ''}`}>
            {getScoreIcon(normalizedHealthScore)}
            {isMobile && (
              <FieldHelpButton 
                field="risk_health_score" 
                content={helpContent.risk_health_score}
              />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={isMobile ? 'px-4 py-3' : ''}>
        <Tabs defaultValue="overview" className="w-full">
          {isMobile ? (
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max min-w-full">
                <TabsTrigger value="overview" className="text-xs px-3 py-2 flex-shrink-0">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="categories" className="text-xs px-3 py-2 flex-shrink-0">
                  <Layers className="w-4 h-4 mr-1" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="radar" className="text-xs px-3 py-2 flex-shrink-0">
                  <Target className="w-4 h-4 mr-1" />
                  Radar
                </TabsTrigger>
                <TabsTrigger value="heatmap" className="text-xs px-3 py-2 flex-shrink-0">
                  <Zap className="w-4 h-4 mr-1" />
                  Mapa
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          ) : (
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
          )}

          <TabsContent value="overview" className={`space-y-4 ${isMobile ? 'mt-2' : 'mt-4'}`}>
            {/* Score principal */}
            <div className="text-center">
              <div className={`font-bold mb-2 animate-fade-in ${isMobile ? 'text-3xl' : 'text-4xl'}`}>
                {normalizedHealthScore}
                <span className={`text-lg ml-2 ${isMobile ? 'block text-base mt-1' : ''}`}>
                  {getScoreTrendIcon(normalizedHealthScore)}
                </span>
              </div>
              <div className={`font-medium text-muted-foreground mb-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {getScoreLabel(normalizedHealthScore)}
                {categoryScores.length > 1 && (
                  <span className={`block text-muted-foreground ${isMobile ? 'text-xs mt-1' : 'text-xs'}`}>
                    Score Ponderado por {categoryScores.length} Categorias
                  </span>
                )}
                {selectedProject && (
                  <span className={`block text-primary font-medium ${isMobile ? 'text-xs mt-1' : 'text-xs'}`}>
                    Filtrado para {filteredRisks.length} riscos
                  </span>
                )}
                <span className={`block text-xs text-muted-foreground/70 mt-1`}>
                  Score Original: {rawHealthScore}/85 → Normalizado: {normalizedHealthScore}/100
                </span>
              </div>
              <Progress value={normalizedHealthScore} className={`transition-all duration-500 ${isMobile ? 'h-2' : 'h-3'}`} />
            </div>

            {/* Dashboard de Progresso da Mitigação */}
            <div className={`grid gap-2 text-center ${isMobile ? 'grid-cols-2 text-xs' : 'grid-cols-4 text-sm'}`}>
              <div className={`rounded-lg bg-category-compliance-bg/50 transition-all duration-200 hover:scale-105 ${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="font-semibold text-category-compliance">{mitigationMetrics.risksWithActions}</div>
                <div className="text-xs text-muted-foreground">Ações Definidas</div>
              </div>
              <div className={`rounded-lg bg-risk-warning-bg/50 transition-all duration-200 hover:scale-105 ${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="font-semibold text-risk-warning">{mitigationMetrics.risksInProgress}</div>
                <div className="text-xs text-muted-foreground">Em Execução</div>
              </div>
              <div className={`rounded-lg bg-risk-excellent-bg/50 transition-all duration-200 hover:scale-105 ${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="font-semibold text-risk-excellent">{mitigationMetrics.effectivelyMitigated}</div>
                <div className="text-xs text-muted-foreground">Mitigados</div>
              </div>
              <div className={`rounded-lg bg-category-financial-bg/50 transition-all duration-200 hover:scale-105 ${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="font-semibold text-category-financial">{Math.round(mitigationMetrics.mitigationEfficiency)}%</div>
                <div className="text-xs text-muted-foreground">Eficiência</div>
              </div>
            </div>

            {/* Métricas detalhadas */}
            <div className={`grid grid-cols-2 gap-3 text-center border-t pt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <div className={`rounded-lg bg-category-strategic-bg/30 ${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="font-semibold text-category-strategic">{filteredRisks.filter(r => r.responsavel_id).length}/{filteredRisks.length}</div>
                <div className="text-muted-foreground">Atribuídos</div>
              </div>
              <div className={`rounded-lg bg-category-operational-bg/30 ${isMobile ? 'p-3' : 'p-2'}`}>
                <div className="font-semibold text-category-operational">{Math.round(mitigationMetrics.actionQualityScore * 100)}%</div>
                <div className="text-muted-foreground">Qualidade</div>
              </div>
            </div>

            {/* Badges de conquistas */}
            {getBadges().length > 0 && (
              <div className={`flex flex-wrap gap-1 ${isMobile ? 'justify-center' : ''}`}>
                {getBadges().map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <Badge key={index} variant="secondary" className={`border transition-all duration-200 hover:scale-105 ${badge.color} ${isMobile ? 'text-xs px-2 py-1' : 'text-xs'}`}>
                      <Icon className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-3 h-3 mr-1'}`} />
                      {badge.text}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Alertas Proativos e Sugestões */}
            {suggestions.length > 0 && (
              <div className={`space-y-2 ${isMobile ? 'px-1' : ''}`}>
                <div className={`flex items-center gap-2 font-medium text-muted-foreground ${isMobile ? 'text-xs justify-center' : 'text-xs'}`}>
                  <AlertTriangle className="w-3 h-3" />
                  Sugestões de Melhoria
                </div>
                <div className="space-y-1">
                  {suggestions.slice(0, isMobile ? 1 : 2).map((suggestion, index) => (
                    <div key={index} className={`text-muted-foreground bg-muted/50 rounded transition-all duration-200 hover:bg-muted/70 ${isMobile ? 'text-xs p-3 text-center' : 'text-xs p-2'}`}>
                      💡 {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas gerais quando score bom */}
            {normalizedHealthScore >= 81 && suggestions.length === 0 && (
              <div className={`text-risk-excellent bg-risk-excellent-bg rounded border border-risk-excellent-border animate-pulse ${isMobile ? 'text-xs p-3 text-center' : 'text-xs p-2'}`}>
                🎉 Excelente gestão de riscos! Continue monitorando e atualizando.
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className={isMobile ? 'mt-2' : 'mt-4'}>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {categoryScores.map((categoryScore) => (
                <CategoryHealthCard
                  key={categoryScore.category}
                  categoryScore={categoryScore}
                  onCategoryClick={(category) => onCategoryFilter?.(category)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="radar" className={isMobile ? 'mt-2' : 'mt-4'}>
            <CategoryRadarChart categoryScores={categoryScores} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="heatmap" className={isMobile ? 'mt-2' : 'mt-4'}>
            <CategoryHeatmap 
              categoryScores={categoryScores}
              onCellClick={(category, level) => onCategoryFilter?.(category, level)}
              isMobile={isMobile}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};