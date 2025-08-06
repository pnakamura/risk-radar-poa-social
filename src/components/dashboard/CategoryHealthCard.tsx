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
import { CategoryHealthScore } from '@/utils/riskHealthCalculations';

interface CategoryHealthCardProps {
  categoryScore: CategoryHealthScore;
  onCategoryClick?: (category: string) => void;
}

export const CategoryHealthCard = ({ categoryScore, onCategoryClick }: CategoryHealthCardProps) => {
  const { category, healthScore, mitigationMetrics, benchmarkScore, insights, trend, priority } = categoryScore;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'border-risk-excellent-border bg-risk-excellent-bg shadow-lg shadow-risk-excellent/10';
    if (score >= 50) return 'border-risk-good-border bg-risk-good-bg shadow-lg shadow-risk-good/10';
    return 'border-risk-critical-border bg-risk-critical-bg shadow-lg shadow-risk-critical/10';
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
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover-lift border-2 ${getScoreColor(healthScore.finalScore)}`}
      onClick={() => onCategoryClick?.(category)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <span className="font-bold">{category}</span>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {getPriorityBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score principal */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1 animate-fade-in">{healthScore.finalScore}</div>
          <div className="text-xs text-muted-foreground mb-2">
            Meta: {benchmarkScore} | {categoryScore.risks.length} riscos
          </div>
          <Progress value={healthScore.finalScore} className="h-2 transition-all duration-500" />
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-1 rounded bg-category-compliance-bg/30 transition-all duration-200 hover:scale-105">
            <div className="font-semibold text-category-compliance">{mitigationMetrics.risksWithActions}</div>
            <div className="text-muted-foreground">Ações</div>
          </div>
          <div className="p-1 rounded bg-risk-warning-bg/30 transition-all duration-200 hover:scale-105">
            <div className="font-semibold text-risk-warning">{mitigationMetrics.risksInProgress}</div>
            <div className="text-muted-foreground">Progresso</div>
          </div>
          <div className="p-1 rounded bg-risk-excellent-bg/30 transition-all duration-200 hover:scale-105">
            <div className="font-semibold text-risk-excellent">{mitigationMetrics.effectivelyMitigated}</div>
            <div className="text-muted-foreground">Mitigados</div>
          </div>
        </div>

        {/* Insights principais */}
        {insights.length > 0 && (
          <div className="space-y-1">
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-xs text-muted-foreground bg-muted/30 p-2 rounded transition-all duration-200 hover:bg-muted/50">
                💡 {insight}
              </div>
            ))}
          </div>
        )}

        {/* Distribuição de riscos críticos */}
        {categoryScore.risks.filter(r => r.nivel_risco === 'Crítico').length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-3 h-3 text-risk-critical animate-pulse" />
            <span className="text-risk-critical font-medium">
              {categoryScore.risks.filter(r => r.nivel_risco === 'Crítico').length} críticos
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};