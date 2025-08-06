import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryHealthScore } from '@/utils/riskHealthCalculations';

interface CategoryHeatmapProps {
  categoryScores: CategoryHealthScore[];
  onCellClick?: (category: string, level: string) => void;
}

export const CategoryHeatmap = ({ categoryScores, onCellClick }: CategoryHeatmapProps) => {
  const riskLevels = ['Crítico', 'Alto', 'Médio', 'Baixo'];
  
  const getCellColor = (count: number, total: number) => {
    if (total === 0) return 'bg-gray-100';
    const intensity = count / total;
    if (intensity === 0) return 'bg-gray-50';
    if (intensity <= 0.2) return 'bg-yellow-100 hover:bg-yellow-200';
    if (intensity <= 0.4) return 'bg-orange-100 hover:bg-orange-200';
    if (intensity <= 0.6) return 'bg-red-100 hover:bg-red-200';
    return 'bg-red-200 hover:bg-red-300';
  };

  const getCellData = (category: string, level: string) => {
    const categoryData = categoryScores.find(c => c.category === category);
    if (!categoryData) return { count: 0, total: 0 };
    
    const count = categoryData.risks.filter(r => r.nivel_risco === level).length;
    const total = categoryData.risks.length;
    return { count, total };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          🔥 Mapa de Calor: Categorias vs Níveis de Risco
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header com níveis de risco */}
            <div className="grid grid-cols-5 gap-1 mb-2">
              <div className="text-sm font-medium text-muted-foreground p-2">
                Categoria
              </div>
              {riskLevels.map(level => (
                <div key={level} className="text-xs font-medium text-center p-2 bg-muted rounded">
                  {level}
                </div>
              ))}
            </div>

            {/* Grid principal */}
            <div className="space-y-1">
              {categoryScores.map(categoryScore => (
                <div key={categoryScore.category} className="grid grid-cols-5 gap-1">
                  {/* Nome da categoria */}
                  <div className="text-sm font-medium p-2 bg-muted/50 rounded flex items-center justify-between">
                    <span className="truncate">{categoryScore.category}</span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {categoryScore.risks.length}
                    </Badge>
                  </div>
                  
                  {/* Células do heatmap */}
                  {riskLevels.map(level => {
                    const { count, total } = getCellData(categoryScore.category, level);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    return (
                      <div
                        key={`${categoryScore.category}-${level}`}
                        className={`
                          p-2 rounded text-center cursor-pointer transition-colors
                          ${getCellColor(count, total)}
                          border border-transparent hover:border-primary/50
                        `}
                        onClick={() => onCellClick?.(categoryScore.category, level)}
                        title={`${categoryScore.category} - ${level}: ${count}/${total} riscos (${percentage}%)`}
                      >
                        <div className="text-sm font-bold">{count}</div>
                        {percentage > 0 && (
                          <div className="text-xs text-muted-foreground">{percentage}%</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 p-3 bg-muted/30 rounded">
          <div className="text-xs font-medium mb-2">Intensidade por categoria:</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-gray-50 border rounded"></div>
            <span>0%</span>
            <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
            <span>1-20%</span>
            <div className="w-4 h-4 bg-orange-100 border rounded"></div>
            <span>21-40%</span>
            <div className="w-4 h-4 bg-red-100 border rounded"></div>
            <span>41-60%</span>
            <div className="w-4 h-4 bg-red-200 border rounded"></div>
            <span>60%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};