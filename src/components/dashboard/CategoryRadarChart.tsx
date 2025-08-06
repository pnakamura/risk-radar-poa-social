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
                stroke="hsl(142 76% 36%)"
                fill="hsl(142 76% 36%)"
                fillOpacity={0.6}
                strokeWidth={3}
                dot={{ fill: 'hsl(142 76% 36%)', strokeWidth: 2, r: 4 }}
              />
              <Radar
                name="Meta"
                dataKey="benchmark"
                stroke="hsl(25 95% 53%)"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: 'hsl(25 95% 53%)', strokeWidth: 2, r: 3 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(142 76% 36%)' }}></div>
            <span className="font-medium">Score Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 border-2 border-dashed rounded" style={{ borderColor: 'hsl(25 95% 53%)' }}></div>
            <span className="font-medium">Meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};