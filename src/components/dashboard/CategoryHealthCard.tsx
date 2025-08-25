import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Target,
  BarChart3 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CategoryHealthScore } from '@/utils/riskHealthCalculations';
import { normalizeScore, getSemanticScoreColor, getScoreLabel } from '@/utils/scoreNormalization';

interface CategoryHealthCardProps {
  categoryScore: CategoryHealthScore;
  onCategoryClick?: (category: string) => void;
}

export const CategoryHealthCard = ({ categoryScore, onCategoryClick }: CategoryHealthCardProps) => {
  const isMobile = useIsMobile();
  const { category, healthScore, mitigationMetrics, benchmarkScore, insights, trend, priority } = categoryScore;
  const rawScore = healthScore.finalScore;
  const normalizedScore = normalizeScore(rawScore);
  const normalizedBenchmark = normalizeScore(benchmarkScore);
  
  const getScoreColor = (normalizedScore: number) => {
    return getSemanticScoreColor(normalizedScore).replace('text-', 'border-').replace(' bg-', ' bg-').replace(' border-', ' border-') + ' shadow-lg';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-risk-excellent animate-pulse" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-risk-critical animate-bounce" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = () => {
    const variants = {
      critical: 'bg-risk-critical-bg text-risk-critical border-risk-critical-border',
      high: 'bg-risk-warning-bg text-risk-warning border-risk-warning-border',
      medium: 'bg-risk-good-bg text-risk-good border-risk-good-border',
      low: 'bg-risk-excellent-bg text-risk-excellent border-risk-excellent-border'
    };
    
    const labels = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Média', 
      low: 'Baixa'
    };

    return (
      <Badge variant="outline" className={`text-xs transition-all duration-200 hover:scale-105 ${variants[priority]}`}>
        {labels[priority]}
      </Badge>
    );
  };

  const getCategoryIcon = () => {
    const icons = {
      'Estratégico': Target,
      'Operacional': BarChart3,
      'Financeiro': TrendingUp,
      'Compliance': CheckCircle2,
      'Regulatório': AlertTriangle
    };
    
    const categoryColors = {
      'Estratégico': 'text-category-strategic',
      'Operacional': 'text-category-operational',
      'Financeiro': 'text-category-financial',
      'Compliance': 'text-category-compliance',
      'Regulatório': 'text-category-regulatory'
    };
    
    const Icon = icons[category as keyof typeof icons] || BarChart3;
    const colorClass = categoryColors[category as keyof typeof categoryColors] || 'text-muted-foreground';
    
    return <Icon className={`w-5 h-5 ${colorClass}`} />;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover-lift border-2 ${getScoreColor(normalizedScore)} ${isMobile ? 'active:scale-95' : 'hover:scale-[1.02]'}`}
      onClick={() => onCategoryClick?.(category)}
    >
      <CardHeader className={isMobile ? 'pb-2 px-3 py-3' : 'pb-3'}>
        <CardTitle className={`flex items-center ${isMobile ? 'flex-col gap-2 text-sm' : 'justify-between text-base'}`}>
          <div className={`flex items-center gap-2 ${isMobile ? 'flex-col text-center' : ''}`}>
            {getCategoryIcon()}
            <span className={`font-bold ${isMobile ? 'text-sm break-words text-center max-w-[140px] leading-tight' : ''}`}>
              {category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {getPriorityBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'space-y-3 px-3 py-2' : 'space-y-4'}`}>
        {/* Score principal */}
        <div className="text-center">
          <div className={`font-bold mb-1 animate-fade-in ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {normalizedScore}
          </div>
          <div className={`text-muted-foreground mb-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            <div>{getScoreLabel(normalizedScore)}</div>
            <div className="text-xs opacity-70 mt-1">
              Meta: {normalizedBenchmark} | {categoryScore.risks.length} riscos
            </div>
            <div className="text-xs opacity-60 mt-1">
              {rawScore}/85 → {normalizedScore}/100
            </div>
          </div>
          <Progress value={normalizedScore} className={`transition-all duration-500 ${isMobile ? 'h-1.5' : 'h-2'}`} />
        </div>

        {/* Métricas simplificadas - foco no essencial */}
        <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <div className="text-center">
            <div className="font-semibold text-category-compliance">{mitigationMetrics.risksWithActions}</div>
            <div className="text-muted-foreground text-xs">Com Ações</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-risk-warning">{mitigationMetrics.effectivelyMitigated}</div>
            <div className="text-muted-foreground text-xs">Mitigados</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-risk-critical">{categoryScore.risks.filter(r => r.nivel_risco === 'Crítico').length}</div>
            <div className="text-muted-foreground text-xs">Críticos</div>
          </div>
        </div>

        {/* Insight principal - apenas o mais relevante */}
        {insights.length > 0 && (
          <div className={`text-muted-foreground bg-muted/30 rounded transition-all duration-200 hover:bg-muted/50 ${isMobile ? 'text-xs p-2 text-center break-words leading-tight' : 'text-xs p-2 break-words'}`}>
            💡 {insights[0]}
          </div>
        )}

        {/* Status visual resumido */}
        <div className={`flex items-center justify-between text-xs ${isMobile ? 'mt-2' : ''}`}>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-muted-foreground capitalize">{
              trend === 'improving' ? 'Melhorando' : 
              trend === 'declining' ? 'Deteriorando' : 'Estável'
            }</span>
          </div>
          {categoryScore.risks.filter(r => r.nivel_risco === 'Crítico').length > 0 && (
            <div className="flex items-center gap-1 text-risk-critical">
              <AlertTriangle className="w-3 h-3 animate-pulse" />
              <span className="font-medium">Atenção!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};