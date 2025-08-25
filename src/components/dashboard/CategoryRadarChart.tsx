import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryHealthScore } from '@/utils/riskHealthCalculations';
import { getChartPalette } from '@/utils/theme';

interface CategoryRadarChartProps {
  categoryScores: CategoryHealthScore[];
  isMobile?: boolean;
}

export const CategoryRadarChart = ({ categoryScores, isMobile = false }: CategoryRadarChartProps) => {
  const data = categoryScores.map(cat => ({
    category: cat.category.substring(0, 8), // Truncar para melhor visualização
    score: cat.healthScore.finalScore,
    benchmark: cat.benchmarkScore,
    fullName: cat.category
  }));

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-2 px-3' : ''}>
        <CardTitle className={`font-bold flex items-center gap-2 ${isMobile ? 'text-sm justify-center' : 'text-lg'}`}>
          📊 Radar de Performance por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'px-2 py-3' : ''}>
        <div className={isMobile ? 'h-[220px]' : 'h-[300px]'}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke={getChartPalette().border} />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: isMobile ? 8 : 10, fill: getChartPalette().muted }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 85]} 
                tick={{ fontSize: isMobile ? 6 : 8, fill: getChartPalette().muted }}
                tickFormatter={(v) => `${v}`}
              />
            <Radar
                name="Score Atual"
                dataKey="score"
                stroke={getChartPalette().excellent}
                fill={getChartPalette().excellent}
                fillOpacity={0.6}
                strokeWidth={isMobile ? 2 : 3}
                dot={{ fill: getChartPalette().excellent, strokeWidth: isMobile ? 1 : 2, r: isMobile ? 3 : 4 }}
              />
              <Radar
                name="Meta"
                dataKey="benchmark"
                stroke={getChartPalette().warning}
                fill="transparent"
                strokeWidth={isMobile ? 1.5 : 2}
                strokeDasharray="8 4"
                dot={{ fill: getChartPalette().warning, strokeWidth: isMobile ? 1 : 2, r: isMobile ? 2 : 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className={`flex justify-center mt-4 ${isMobile ? 'gap-3 text-xs flex-col items-center' : 'gap-6 text-sm'}`}>
          <div className="flex items-center gap-2">
            <div className={`rounded-full ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} style={{ backgroundColor: 'hsl(var(--risk-excellent))' }}></div>
            <span className="font-medium">Score Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`border-2 border-dashed rounded ${isMobile ? 'w-3 h-2' : 'w-4 h-2'}`} style={{ borderColor: 'hsl(var(--risk-warning))' }}></div>
            <span className="font-medium">Meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};