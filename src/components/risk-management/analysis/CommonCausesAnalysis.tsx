import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const CommonCausesAnalysis: React.FC = () => {
  const { commonCauses, loading } = useCausesData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="h-48 bg-muted rounded"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topCauses = commonCauses.slice(0, 10);
  const categoryData = commonCauses.reduce((acc, cause) => {
    cause.categorias.forEach(categoria => {
      if (categoria) {
        acc[categoria] = (acc[categoria] || 0) + cause.frequencia;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const impactDistribution = commonCauses.map(cause => ({
    causa: cause.causa_descricao.substring(0, 20) + '...',
    alto: cause.riscos_alto_impacto,
    medio: cause.riscos_medio_impacto,
    baixo: cause.riscos_baixo_impacto,
    score: parseFloat(cause.impacto_score.toString())
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Causas Identificadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commonCauses.length}</div>
            <p className="text-xs text-muted-foreground">causas recorrentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Impacto</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {commonCauses[0]?.impacto_score.toFixed(1) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">score de impacto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Frequente</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {commonCauses[0]?.frequencia || 0}
            </div>
            <p className="text-xs text-muted-foreground">ocorrências</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(categoryData).length}
            </div>
            <p className="text-xs text-muted-foreground">categorias ativas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Causas Mais Frequentes</CardTitle>
            <CardDescription>
              Top 10 causas com maior número de ocorrências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCauses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="causa_descricao" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Frequência']}
                  labelStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="frequencia" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>
              Análise das causas agrupadas por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Causas por Impacto</CardTitle>
          <CardDescription>
            Causas ordenadas por score de impacto nos riscos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commonCauses.slice(0, 10).map((cause, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{cause.causa_descricao}</span>
                    <Badge variant="secondary">{cause.frequencia} ocorrências</Badge>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    {cause.categorias.map((categoria, catIndex) => (
                      <Badge key={catIndex} variant="outline" className="text-xs">
                        {categoria}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <span>Alto: {cause.riscos_alto_impacto}</span>
                    <span>Médio: {cause.riscos_medio_impacto}</span>
                    <span>Baixo: {cause.riscos_baixo_impacto}</span>
                  </div>
                </div>
                
                <div className="text-right min-w-20">
                  <div className="text-lg font-bold">
                    {cause.impacto_score.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">score</div>
                  <Progress 
                    value={(cause.impacto_score / 3) * 100} 
                    className="w-16 h-2 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};