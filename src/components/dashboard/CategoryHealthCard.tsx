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
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-amber-600" />;
    }
  };

  const getPriorityBadge = () => {
    const variants = {
      critical: 'bg-red-100 text-red-700 border-red-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      medium: 'bg-amber-100 text-amber-700 border-amber-200',
      low: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    
    const labels = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Média', 
      low: 'Baixa'
    };

    return (
      <Badge variant="outline" className={`text-xs ${variants[priority]}`}>
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
    
    const Icon = icons[category as keyof typeof icons] || BarChart3;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md border-2 ${getScoreColor(healthScore.finalScore)}`}
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
          <div className="text-3xl font-bold mb-1">{healthScore.finalScore}</div>
          <div className="text-xs text-muted-foreground mb-2">
            Meta: {benchmarkScore} | {categoryScore.risks.length} riscos
          </div>
          <Progress value={healthScore.finalScore} className="h-2" />
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold text-blue-600">{mitigationMetrics.risksWithActions}</div>
            <div className="text-muted-foreground">Ações</div>
          </div>
          <div>
            <div className="font-semibold text-amber-600">{mitigationMetrics.risksInProgress}</div>
            <div className="text-muted-foreground">Progresso</div>
          </div>
          <div>
            <div className="font-semibold text-emerald-600">{mitigationMetrics.effectivelyMitigated}</div>
            <div className="text-muted-foreground">Mitigados</div>
          </div>
        </div>

        {/* Insights principais */}
        {insights.length > 0 && (
          <div className="space-y-1">
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                💡 {insight}
              </div>
            ))}
          </div>
        )}

        {/* Distribuição de riscos críticos */}
        {categoryScore.risks.filter(r => r.nivel_risco === 'Crítico').length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-red-600 font-medium">
              {categoryScore.risks.filter(r => r.nivel_risco === 'Crítico').length} críticos
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};