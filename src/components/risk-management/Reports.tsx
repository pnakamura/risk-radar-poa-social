import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileDown, Calendar, Filter, BarChart3, PieChart as PieChartIcon, TrendingUp, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ExportModal } from './ExportModal';
import { EmptyState } from '@/components/ui/empty-state';
import { DateRange } from 'react-day-picker';
import { Database } from '@/integrations/supabase/types';
import { useGlobalFilters } from '@/context/GlobalFilterContext';
import { getChartPalette } from '@/utils/theme';
import { ReportsHelpModal } from './help/ReportsHelpModal';
import { InteractiveCommonCausesAnalysis } from './analysis/InteractiveCommonCausesAnalysis';
import { ReportsSkeleton } from '@/components/dashboard/ReportsSkeleton';
// Tipo correto baseado no Supabase
type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface ReportsProps {
  risks: Risk[];
  loading: boolean;
}

const Reports = ({ risks, loading }: ReportsProps) => {
  const { filters, setFilter, clearFilters } = useGlobalFilters();
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>();
  const [quickPeriod, setQuickPeriod] = useState<'all' | '3m' | '6m' | '12m' | 'ytd' | 'custom'>('all');
  const [reportType, setReportType] = useState<'overview' | 'trends' | 'detailed' | 'causes'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const palette = getChartPalette();
  
  if (loading) {
    return <ReportsSkeleton />;
  }

  const filteredRisks = risks
    .filter(risk => {
      const selectedProject = filters.project || 'all';
      const selectedCategory = filters.category || 'all';
      const levelFilter = filters.level || 'all';
      const statusFilter = filters.status || 'all';

      const matchesProject = selectedProject === 'all' || risk.projeto?.nome === selectedProject;
      const matchesCategory = selectedCategory === 'all' || risk.categoria === selectedCategory;
      const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;

      const levelValues = levelFilter === 'all'
        ? []
        : levelFilter === 'critical-high'
          ? ['Crítico', 'Alto']
          : levelFilter.includes(',')
            ? levelFilter.split(',')
            : [levelFilter];
      const matchesLevel = levelFilter === 'all' || levelValues.includes(risk.nivel_risco);
      
      let matchesPeriod = true;
      if (selectedPeriod?.from && selectedPeriod?.to) {
        const riskDate = new Date(risk.data_identificacao);
        matchesPeriod = riskDate >= selectedPeriod.from && riskDate <= selectedPeriod.to;
      }
      
      return matchesProject && matchesCategory && matchesStatus && matchesLevel && matchesPeriod;
    });

  // Preparar dados para gráficos
  const risksByLevel = [
    { name: 'Crítico', value: filteredRisks.filter(r => r.nivel_risco === 'Crítico').length, color: palette.critical },
    { name: 'Alto', value: filteredRisks.filter(r => r.nivel_risco === 'Alto').length, color: palette.warning },
    { name: 'Médio', value: filteredRisks.filter(r => r.nivel_risco === 'Médio').length, color: palette.good },
    { name: 'Baixo', value: filteredRisks.filter(r => r.nivel_risco === 'Baixo').length, color: palette.excellent }
  ];

  const risksByCategory = Object.entries(
    filteredRisks.reduce((acc, risk) => {
      acc[risk.categoria] = (acc[risk.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const risksByStatus = Object.entries(
    filteredRisks.reduce((acc, risk) => {
      acc[risk.status] = (acc[risk.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Dados para tendências (últimos 12 meses + médias)
  const trendData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    const monthRisks = filteredRisks.filter(risk => {
      const dt = new Date(risk.data_identificacao);
      return dt.getMonth() === date.getMonth() && dt.getFullYear() === date.getFullYear();
    });

    const alto = monthRisks.filter(r => r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto').length;
    const medio = monthRisks.filter(r => r.nivel_risco === 'Médio').length;
    const baixo = monthRisks.filter(r => r.nivel_risco === 'Baixo').length;
    const total = monthRisks.length;

    return { month: monthName, total, alto, medio, baixo };
  });

  // Média móvel de 3 meses e acumulado
  let cumulativo = 0;
  for (let i = 0; i < trendData.length; i++) {
    cumulativo += trendData[i].total;
    const window = trendData.slice(Math.max(0, i - 2), i + 1);
    const ma3 = Math.round(window.reduce((s, p) => s + p.total, 0) / window.length);
    (trendData[i] as any).ma3 = ma3;
    (trendData[i] as any).cumulativo = cumulativo;
  }

  const lastPoint = trendData[trendData.length - 1];
  const prevPoint = trendData[trendData.length - 2] || { total: 0 } as any;
  const firstPoint = trendData[0] || { total: 0 } as any;
  const momChange = prevPoint.total > 0 ? Math.round(((lastPoint.total - prevPoint.total) / prevPoint.total) * 100) : 0;
  const yoyChange = firstPoint.total > 0 ? Math.round(((lastPoint.total - firstPoint.total) / firstPoint.total) * 100) : 0;

  const projects = [...new Set(risks.map(r => r.projeto?.nome).filter(Boolean))];
  const categories = [...new Set(risks.map(r => r.categoria).filter(Boolean))];
  const statuses = [...new Set(risks.map(r => r.status).filter(Boolean))];
  const selectLevelValue = (filters.level && filters.level.includes('Crítico,Alto')) ? 'critical-high' : (filters.level || 'all');

  const handleExport = () => {
    setShowExportModal(true);
  };

  const getAppliedFilters = () => ({
    'Período': selectedPeriod ? `${selectedPeriod.from?.toLocaleDateString('pt-BR')} - ${selectedPeriod.to?.toLocaleDateString('pt-BR')}` : 'Sem filtro',
    'Projeto': filters.project || 'Todos',
    'Categoria': filters.category || 'Todas',
    'Nível': selectLevelValue === 'critical-high' ? 'Crítico + Alto' : (filters.level || 'Todos'),
    'Status': filters.status || 'Todos',
    'Tipo de Relatório': reportType
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatórios de Riscos</h1>
          <p className="text-muted-foreground">
            Análise baseada em {filteredRisks.length} de {risks.length} riscos
          </p>
        </div>
        
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Ajuda
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <DatePickerWithRange
                date={selectedPeriod}
                setDate={setSelectedPeriod}
              />
              <div className="mt-2">
                <Select value={quickPeriod} onValueChange={(v: any) => {
                  setQuickPeriod(v);
                  const now = new Date();
                  if (v === 'all') {
                    setSelectedPeriod(undefined);
                    return;
                  }
                  if (v === 'ytd') {
                    setSelectedPeriod({ from: new Date(now.getFullYear(), 0, 1), to: now });
                    return;
                  }
                  if (v === 'custom') return;
                  const months = v === '3m' ? 3 : v === '6m' ? 6 : 12;
                  const from = new Date(now);
                  from.setMonth(from.getMonth() - (months - 1));
                  from.setDate(1);
                  const to = new Date();
                  setSelectedPeriod({ from, to });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sem filtro</SelectItem>
                    <SelectItem value="3m">Últimos 3 meses</SelectItem>
                    <SelectItem value="6m">Últimos 6 meses</SelectItem>
                    <SelectItem value="12m">Últimos 12 meses</SelectItem>
                    <SelectItem value="ytd">Ano corrente (YTD)</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Projeto</label>
              <Select value={filters.project || 'all'} onValueChange={(v) => setFilter('project', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <Select value={filters.category || 'all'} onValueChange={(v) => setFilter('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nível</label>
              <Select value={selectLevelValue} onValueChange={(v) => setFilter('level', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Níveis</SelectItem>
                  <SelectItem value="critical-high">Crítico + Alto</SelectItem>
                  <SelectItem value="Crítico">Crítico</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                  <SelectItem value="Médio">Médio</SelectItem>
                  <SelectItem value="Baixo">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={filters.status || 'all'} onValueChange={(v) => setFilter('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={(value: 'overview' | 'trends' | 'detailed' | 'causes') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Visão Geral</SelectItem>
                  <SelectItem value="trends">Tendências</SelectItem>
                  <SelectItem value="detailed">Detalhado</SelectItem>
                  <SelectItem value="causes">Análise de Causas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo dos Relatórios */}
      <div ref={reportRef}>
        {reportType === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Riscos por Nível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300} minWidth={250}>
                  <PieChart>
                    <Pie
                      data={risksByLevel}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => {
                        if (typeof window !== 'undefined' && window.innerWidth < 640) {
                          return `${name.charAt(0)}: ${value}`;
                        }
                        return `${name}: ${value}`;
                      }}
                      outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                      dataKey="value"
                    >
                      {risksByLevel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Riscos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300}>
                    <BarChart data={risksByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={palette.border} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: palette.muted, fontSize: 12 }} 
                        axisLine={{ stroke: palette.border }} 
                        tickLine={{ stroke: palette.border }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fill: palette.muted, fontSize: 12 }} axisLine={{ stroke: palette.border }} tickLine={{ stroke: palette.border }} />
                      <Tooltip wrapperClassName="recharts-tooltip-wrapper no-export" contentStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="value" fill={palette.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Riscos por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300} minWidth={300}>
                    <BarChart data={risksByStatus} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={palette.border} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: palette.muted, fontSize: 12 }} 
                        axisLine={{ stroke: palette.border }} 
                        tickLine={{ stroke: palette.border }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: palette.muted, fontSize: 12 }} axisLine={{ stroke: palette.border }} tickLine={{ stroke: palette.border }} />
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="value" fill={palette.excellent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{filteredRisks.length}</div>
                      <div className="text-sm text-muted-foreground">Total de Riscos</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{filteredRisks.filter(r => r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto').length}</div>
                      <div className="text-sm text-muted-foreground">Crítico + Alto</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{filteredRisks.filter(r => r.nivel_risco === 'Médio').length}</div>
                      <div className="text-sm text-muted-foreground">Médio</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{filteredRisks.filter(r => r.nivel_risco === 'Baixo').length}</div>
                      <div className="text-sm text-muted-foreground">Baixo</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{filteredRisks.filter(r => r.status === 'Mitigado').length}</div>
                      <div className="text-sm text-muted-foreground">Mitigados</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Esta visão apresenta a distribuição de riscos por nível, categoria e status para apoiar decisões. Utilize os filtros acima para focar em projetos, períodos e estágios específicos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === 'trends' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendência de Identificação de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Variação MoM</div>
                    <div className="text-lg font-semibold text-foreground">{momChange}%</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Variação YoY</div>
                    <div className="text-lg font-semibold text-foreground">{yoyChange}%</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={400} minWidth={300}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={palette.border} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: palette.muted, fontSize: 11 }} 
                        axisLine={{ stroke: palette.border }} 
                        tickLine={{ stroke: palette.border }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: palette.muted, fontSize: 11 }} axisLine={{ stroke: palette.border }} tickLine={{ stroke: palette.border }} />
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="total" stroke={palette.primary} name="Total" strokeWidth={2} />
                      <Line type="monotone" dataKey="alto" stroke={palette.warning} name="Crítico + Alto" strokeWidth={2} />
                      <Line type="monotone" dataKey="medio" stroke={palette.good} name="Médio" strokeWidth={2} />
                      <Line type="monotone" dataKey="baixo" stroke={palette.excellent} name="Baixo" strokeWidth={2} />
                      <Line type="monotone" dataKey="ma3" stroke={palette.foreground} name="Média móvel (3m)" strokeDasharray="4 4" strokeWidth={2} />
                      <Line type="monotone" dataKey="cumulativo" stroke={palette.muted} name="Cumulativo" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-muted-foreground mt-3">A linha de média móvel (3 meses) suaviza variações e evidencia a tendência geral.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Distribuição Mensal por Nível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <ResponsiveContainer width="100%" height={360} minWidth={300}>
                    <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={palette.border} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: palette.muted, fontSize: 11 }} 
                        axisLine={{ stroke: palette.border }} 
                        tickLine={{ stroke: palette.border }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fill: palette.muted, fontSize: 11 }} axisLine={{ stroke: palette.border }} tickLine={{ stroke: palette.border }} />
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="alto" stackId="a" name="Crítico + Alto" fill={palette.warning} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="medio" stackId="a" name="Médio" fill={palette.good} />
                      <Bar dataKey="baixo" stackId="a" name="Baixo" fill={palette.excellent} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-muted-foreground mt-3">Barras empilhadas mostram a composição por nível de severidade mês a mês.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === 'causes' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Causas Comuns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Análise detalhada das causas mais frequentes e de maior impacto nos riscos identificados.
                </p>
                <InteractiveCommonCausesAnalysis />
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === 'detailed' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Lista de riscos filtrada conforme os critérios selecionados. Ordene e exporte conforme necessário.</p>
                {filteredRisks.length === 0 ? (
                  <EmptyState
                    icon="general"
                    title="Nenhum risco encontrado"
                    description="Ajuste os filtros ou o período para visualizar resultados."
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredRisks.map((risk) => (
                      <div key={risk.id} className="border-l-4 border-border pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-foreground">{risk.codigo} - {risk.descricao_risco}</h4>
                            <p className="text-sm text-muted-foreground">Categoria: {risk.categoria}</p>
                            <p className="text-sm text-muted-foreground">Nível: {risk.nivel_risco}</p>
                            <p className="text-sm text-muted-foreground">Status: {risk.status}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>Criado em: {new Date(risk.data_identificacao).toLocaleDateString('pt-BR')}</p>
                            <p>Responsável: {risk.responsavel?.nome || 'Não atribuído'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        risks={filteredRisks}
        appliedFilters={getAppliedFilters()}
        reportRef={reportRef}
      />

      <ReportsHelpModal open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
};

export default Reports;
