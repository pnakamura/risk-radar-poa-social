import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink, Filter, X } from 'lucide-react';
import { RiskHealthScore } from '@/components/dashboard/RiskHealthScore';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2 font-heading tracking-tight">Dashboard de Riscos</h3>
          <p className="text-muted-foreground">
            {selectedProject 
              ? `${totalRisks} riscos no projeto "${selectedProject}"`
              : `Visão geral de ${totalRisks} riscos identificados`
            }
          </p>
        </div>
        
        {/* Filtro de Projeto */}
        {availableProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedProject || 'all'} onValueChange={(value) => value === 'all' ? clearFilters({ preserve: [] }) : setFilters({ project: value })}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Todos os projetos" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                <SelectItem value="all">Todos os projetos</SelectItem>
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

      {/* Filtros ativos */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {filters.project && (
          <Badge variant="secondary" className="flex items-center gap-2">
            Projeto: {filters.project}
            <button aria-label="Remover filtro de projeto" className="focus-ring" onClick={() => setFilter('project','')}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {filters.level && (
          <Badge variant="secondary" className="flex items-center gap-2">
            Nível: {filters.level}
            <button aria-label="Remover filtro de nível" className="focus-ring" onClick={() => setFilter('level','')}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {filters.status && (
          <Badge variant="secondary" className="flex items-center gap-2">
            Status: {filters.status}
            <button aria-label="Remover filtro de status" className="focus-ring" onClick={() => setFilter('status','')}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}
        {filters.category && (
          <Badge variant="secondary" className="flex items-center gap-2">
            Categoria: {filters.category}
            <button aria-label="Remover filtro de categoria" className="focus-ring" onClick={() => setFilter('category','')}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {(filters.project || filters.level || filters.status || filters.category) && (
          <Button variant="ghost" size="sm" onClick={() => clearFilters()}>Limpar</Button>
        )}
      </div>

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

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="interactive-card hover-lift animate-fade-in cursor-pointer"
          onClick={() => handleCardClick('total')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('total')}
          aria-label="Ver todos os riscos"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-muted rounded-lg" aria-hidden="true">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total de Riscos</p>
                  <p className="text-2xl font-bold text-foreground">{totalRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para ver todos</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="interactive-card hover-lift animate-fade-in cursor-pointer"
          onClick={() => handleCardClick('critical-high')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('critical-high')}
          aria-label="Ver riscos críticos e altos"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-risk-critical-bg rounded-lg" aria-hidden="true">
                  <AlertTriangle className="w-6 h-6 text-risk-critical" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Riscos Críticos/Altos</p>
                  <p className="text-2xl font-bold text-risk-critical">{highRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para filtrar</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="interactive-card hover-lift animate-fade-in cursor-pointer"
          onClick={() => handleCardClick('mitigated')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('mitigated')}
          aria-label="Ver riscos mitigados"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-risk-excellent-bg rounded-lg" aria-hidden="true">
                  <CheckCircle className="w-6 h-6 text-risk-excellent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Riscos Mitigados</p>
                  <p className="text-2xl font-bold text-risk-excellent">{mitigatedRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para filtrar</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="interactive-card hover-lift animate-fade-in cursor-pointer"
          onClick={() => handleCardClick('monitoring')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCardClick('monitoring')}
          aria-label="Ver riscos em monitoramento"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-risk-warning-bg rounded-lg" aria-hidden="true">
                  <Clock className="w-6 h-6 text-risk-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Em Monitoramento</p>
                  <p className="text-2xl font-bold text-risk-warning">{mediumRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para filtrar</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Riscos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke={getChartPalette().border} strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: getChartPalette().muted, fontSize: 12 }} 
                    axisLine={{ stroke: getChartPalette().border }} 
                    tickLine={{ stroke: getChartPalette().border }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: getChartPalette().muted, fontSize: 12 }} axisLine={{ stroke: getChartPalette().border }} tickLine={{ stroke: getChartPalette().border }} />
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="value" fill={getChartPalette().primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Distribuição por Nível de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <PieChart>
                <Pie
                  data={riskByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => {
                    // Simplificar label em telas pequenas
                    if (window.innerWidth < 640) {
                      return `${name.charAt(0)}: ${value}`;
                    }
                    return `${name}: ${value}`;
                  }}
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  dataKey="value"
                >
                  {riskByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
