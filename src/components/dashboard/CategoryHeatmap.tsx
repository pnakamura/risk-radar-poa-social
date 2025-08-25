import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryHealthScore } from '@/utils/riskHealthCalculations';

interface CategoryHeatmapProps {
  categoryScores: CategoryHealthScore[];
  onCellClick?: (category: string, level: string) => void;
  isMobile?: boolean;
}

export const CategoryHeatmap = ({ categoryScores, onCellClick, isMobile = false }: CategoryHeatmapProps) => {
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
      <CardHeader className={isMobile ? 'pb-2 px-3' : ''}>
        <CardTitle className={`font-bold flex items-center gap-2 ${isMobile ? 'text-sm justify-center' : 'text-lg'}`}>
          🔥 Mapa de Calor: Categorias vs Níveis de Risco
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-2 py-3' : ''}>
        <div className="overflow-x-auto">
          <div className={isMobile ? 'min-w-[320px]' : 'min-w-[600px]'}>
            {/* Header com níveis de risco */}
            <div className="grid grid-cols-5 gap-1 mb-2">
              <div className={`font-medium text-muted-foreground p-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Categoria
              </div>
              {riskLevels.map(level => (
                <div key={level} className={`font-medium text-center p-2 bg-muted rounded ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {isMobile ? level.substr(0, 4) : level}
                </div>
              ))}
            </div>

            {/* Grid principal */}
            <div className="space-y-1">
              {categoryScores.map(categoryScore => (
                <div key={categoryScore.category} className="grid grid-cols-5 gap-1">
                  {/* Nome da categoria */}
                  <div className={`font-medium bg-muted/50 rounded flex items-center justify-between ${isMobile ? 'text-xs p-1.5' : 'text-sm p-2'}`}>
                    <span className="truncate">{isMobile ? categoryScore.category.substr(0, 8) : categoryScore.category}</span>
                    <Badge variant="outline" className={`ml-1 ${isMobile ? 'text-xs px-1 py-0' : 'text-xs ml-2'}`}>
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
                          rounded text-center cursor-pointer transition-colors
                          ${getCellColor(count, total)}
                          border border-transparent ${isMobile ? 'active:scale-95 p-1.5' : 'hover:border-primary/50 p-2'}
                        `}
                        onClick={() => onCellClick?.(categoryScore.category, level)}
                        title={`${categoryScore.category} - ${level}: ${count}/${total} riscos (${percentage}%)`}
                      >
                        <div className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'}`}>{count}</div>
                        {percentage > 0 && (
                          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>{percentage}%</div>
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
        <div className={`p-3 bg-muted/30 rounded ${isMobile ? 'mt-3' : 'mt-4'}`}>
          <div className={`font-medium mb-2 ${isMobile ? 'text-xs text-center' : 'text-xs'}`}>Intensidade por categoria:</div>
          <div className={`flex items-center gap-2 text-xs ${isMobile ? 'justify-center flex-wrap' : ''}`}>
            <div className="flex items-center gap-1">
              <div className={`bg-gray-50 border rounded ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
              <span>0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`bg-yellow-100 border rounded ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
              <span>1-20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`bg-orange-100 border rounded ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
              <span>21-40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`bg-red-100 border rounded ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
              <span>41-60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`bg-red-200 border rounded ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}></div>
              <span>60%+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};