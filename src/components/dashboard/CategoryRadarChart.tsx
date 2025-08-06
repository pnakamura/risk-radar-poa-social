import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryHealthScore } from '@/utils/riskHealthCalculations';

interface CategoryRadarChartProps {
  categoryScores: CategoryHealthScore[];
}

export const CategoryRadarChart = ({ categoryScores }: CategoryRadarChartProps) => {
  const data = categoryScores.map(cat => ({
    category: cat.category.substring(0, 8), // Truncar para melhor visualização
    score: cat.healthScore.finalScore,
    benchmark: cat.benchmarkScore,
    fullName: cat.category
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          📊 Radar de Performance por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis 
                dataKey="category" 
                className="text-xs fill-foreground"
                tick={{ fontSize: 10 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 85]} 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 8 }}
              />
              <Radar
                name="Score Atual"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Meta"
                dataKey="benchmark"
                stroke="hsl(var(--muted-foreground))"
                fill="transparent"
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full opacity-60"></div>
            <span>Score Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 border border-muted-foreground border-dashed"></div>
            <span>Meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};