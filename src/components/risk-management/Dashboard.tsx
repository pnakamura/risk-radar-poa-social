import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink, Filter, X, BarChart3, Layers } from 'lucide-react';
import { RiskHealthScore } from '@/components/dashboard/RiskHealthScore';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ProjectHealthAnalysis } from '@/components/dashboard/ProjectHealthAnalysis';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { useGlobalFilters } from '@/context/GlobalFilterContext';
import { getChartPalette } from '@/utils/theme';
type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface DashboardProps {
  risks: Risk[];
  loading: boolean;
}

const Dashboard = ({ risks, loading }: DashboardProps) => {
  const navigate = useNavigate();
  const { filters, setFilter, setFilters, clearFilters, buildSearchString } = useGlobalFilters();
  const selectedProject = filters.project;
  
  // Obter lista única de projetos
  const availableProjects = React.useMemo(() => {
    const projects = risks
      .map(risk => risk.projeto?.nome)
      .filter((nome): nome is string => Boolean(nome))
      .filter((nome, index, array) => array.indexOf(nome) === index)
      .sort();
    return projects;
  }, [risks]);

  const handleCardClick = (filterType: string, filterValue?: string) => {
    type FilterOverrides = Partial<Record<'project' | 'category' | 'level' | 'status' | 'search', string>>;
    const base: FilterOverrides = { category: '', status: '', search: '', level: '' };
    let overrides: FilterOverrides = base;

    switch (filterType) {
      case 'critical-high':
        overrides = { ...base, level: 'critical-high' };
        break;
      case 'mitigated':
        overrides = { ...base, status: 'Mitigado' };
        break;
      case 'monitoring':
        overrides = { ...base, level: 'Médio' };
        break;
      case 'total':
        overrides = base; // limpa filtros, mantém projeto atual
        break;
      default:
        if (filterValue) {
          overrides = { ...base, [filterType]: filterValue } as FilterOverrides;
        }
    }

    const qs = buildSearchString(overrides);
    const params = new URLSearchParams(qs);
    params.set('tab', 'matrix');
    if (selectedProject) params.set('project', selectedProject);
    navigate(`/?${params.toString()}`);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Filtrar riscos por projeto se selecionado
  const filteredRisks = selectedProject 
    ? risks.filter(risk => risk.projeto?.nome === selectedProject)
    : risks;

  // Calcular métricas baseadas nos riscos filtrados
  const totalRisks = filteredRisks.length;
  const highRisks = filteredRisks.filter(r => r.nivel_risco === 'Alto' || r.nivel_risco === 'Crítico').length;
  const mediumRisks = filteredRisks.filter(r => r.nivel_risco === 'Médio').length;
  const lowRisks = filteredRisks.filter(r => r.nivel_risco === 'Baixo').length;
  const mitigatedRisks = filteredRisks.filter(r => r.status === 'Mitigado').length;

  // Dados para gráficos baseados nos riscos filtrados
  const riskByCategory = filteredRisks.reduce((acc, risk) => {
    acc[risk.categoria] = (acc[risk.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(riskByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const riskByLevel = [
    { name: 'Crítico', value: filteredRisks.filter(r => r.nivel_risco === 'Crítico').length, color: getChartPalette().critical },
    { name: 'Alto', value: filteredRisks.filter(r => r.nivel_risco === 'Alto').length, color: getChartPalette().warning },
    { name: 'Médio', value: filteredRisks.filter(r => r.nivel_risco === 'Médio').length, color: getChartPalette().good },
    { name: 'Baixo', value: filteredRisks.filter(r => r.nivel_risco === 'Baixo').length, color: getChartPalette().excellent }
  ];
 
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section - Compacto */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 p-6 border border-primary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-heading tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Dashboard de Riscos
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                {totalRisks}
              </span>
              {selectedProject 
                ? `riscos no projeto "${selectedProject}"`
                : 'riscos identificados e em análise'
              }
            </p>
          </div>
          
          {/* Filtro de Projeto */}
          {availableProjects.length > 0 && (
            <div className="relative flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 border border-border/50 shadow-sm">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Filter className="w-3.5 h-3.5 text-primary" />
              </div>
              <Select value={selectedProject || 'all'} onValueChange={(value) => value === 'all' ? clearFilters({ preserve: [] }) : setFilters({ project: value })}>
                <SelectTrigger className="w-[200px] border-0 bg-transparent focus:ring-2 focus:ring-primary/20 h-8 text-sm">
                  <SelectValue placeholder="Todos os projetos" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="all">
                    <span className="font-medium">Todos os projetos</span>
                  </SelectItem>
                  {availableProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Filtros ativos - Compacto */}
      {(filters.project || filters.level || filters.status || filters.category) && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Filtros ativos:</span>
          {filters.project && (
            <Badge variant="secondary" className="flex items-center gap-2 hover-lift bg-category-strategic-bg text-category-strategic border-category-strategic/20">
              <span className="font-medium">Projeto:</span> {filters.project}
              <button aria-label="Remover filtro de projeto" className="focus-ring ml-1 hover:text-destructive transition-colors" onClick={() => setFilter('project','')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.level && (
            <Badge variant="secondary" className="flex items-center gap-2 hover-lift bg-risk-warning-bg text-risk-warning border-risk-warning-border">
              <span className="font-medium">Nível:</span> {filters.level}
              <button aria-label="Remover filtro de nível" className="focus-ring ml-1 hover:text-destructive transition-colors" onClick={() => setFilter('level','')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-2 hover-lift bg-category-compliance-bg text-category-compliance border-category-compliance/20">
              <span className="font-medium">Status:</span> {filters.status}
              <button aria-label="Remover filtro de status" className="focus-ring ml-1 hover:text-destructive transition-colors" onClick={() => setFilter('status','')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-2 hover-lift bg-category-operational-bg text-category-operational border-category-operational/20">
              <span className="font-medium">Categoria:</span> {filters.category}
              <button aria-label="Remover filtro de categoria" className="focus-ring ml-1 hover:text-destructive transition-colors" onClick={() => setFilter('category','')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => clearFilters()} className="ml-auto hover:bg-destructive/10 hover:text-destructive">
            Limpar todos
          </Button>
        </div>
      )}

      {/* Análise Narrativa da Saúde do Projeto */}
      <ProjectHealthAnalysis 
        risks={filteredRisks}
        selectedProject={selectedProject || undefined}
        normalizedScore={(() => {
          const healthScore = require('@/utils/riskHealthCalculations').calculateAdvancedHealthScore(filteredRisks);
          const categoryScores = require('@/utils/riskHealthCalculations').calculateCategoryHealthScores(filteredRisks);
          const weightedScore = require('@/utils/riskHealthCalculations').calculateWeightedOverallScore(categoryScores);
          const rawScore = weightedScore || healthScore.finalScore;
          return require('@/utils/scoreNormalization').normalizeScore(rawScore);
        })()}
      />

      {/* Risk Health Score e Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskHealthScore 
          risks={filteredRisks} 
          selectedProject={selectedProject || undefined}
        />
        <ActivityTimeline 
          risks={filteredRisks} 
          selectedProject={selectedProject}
          loading={loading}
        />
      </div>

      {/* Métricas Principais - Compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="group relative overflow-hidden border border-border/50 hover:border-primary/30 transition-all cursor-pointer hover-lift"
          onClick={() => handleCardClick('total')}
        >
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Total de Riscos</p>
                <p className="text-2xl font-bold text-foreground">{totalRisks}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group relative overflow-hidden border border-border/50 hover:border-risk-critical/30 transition-all cursor-pointer hover-lift"
          onClick={() => handleCardClick('critical-high')}
        >
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Críticos & Altos</p>
                <p className="text-2xl font-bold text-risk-critical">{highRisks}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-risk-critical-bg to-risk-critical-bg/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-risk-critical" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group relative overflow-hidden border border-border/50 hover:border-risk-excellent/30 transition-all cursor-pointer hover-lift"
          onClick={() => handleCardClick('mitigated')}
        >
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Mitigados</p>
                <p className="text-2xl font-bold text-risk-excellent">{mitigatedRisks}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-risk-excellent-bg to-risk-excellent-bg/50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-risk-excellent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="group relative overflow-hidden border border-border/50 hover:border-risk-warning/30 transition-all cursor-pointer hover-lift"
          onClick={() => handleCardClick('monitoring')}
        >
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Em Monitoramento</p>
                <p className="text-2xl font-bold text-risk-warning">{mediumRisks}</p>
              </div>
              <div className="p-2 bg-gradient-to-br from-risk-warning-bg to-risk-warning-bg/50 rounded-lg">
                <Clock className="w-5 h-5 text-risk-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Compacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border/50 hover:border-primary/20 transition-all overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              Riscos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto bg-muted/20 rounded-lg p-3">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke={getChartPalette().border} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: getChartPalette().muted, fontSize: 11 }} 
                    axisLine={{ stroke: getChartPalette().border }} 
                    tickLine={{ stroke: getChartPalette().border }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tick={{ fill: getChartPalette().muted, fontSize: 11 }} 
                    axisLine={{ stroke: getChartPalette().border }} 
                    tickLine={{ stroke: getChartPalette().border }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '11px', 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill={getChartPalette().primary} 
                    radius={[6, 6, 0, 0]}
                    animationDuration={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 hover:border-primary/20 transition-all overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              Distribuição por Nível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/20 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={250} minWidth={250}>
                <PieChart>
                  <Pie
                    data={riskByLevel}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      if (window.innerWidth < 640) {
                        return `${name.charAt(0)}: ${value}`;
                      }
                      return `${name}: ${value}`;
                    }}
                    outerRadius={window.innerWidth < 640 ? 55 : 75}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {riskByLevel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '11px',
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
