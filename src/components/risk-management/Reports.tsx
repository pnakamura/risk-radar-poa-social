import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Filter, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useReportData } from '@/hooks/useReportData';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { addDays, subMonths } from 'date-fns';

// Interface compatível com dados do Supabase
interface ReportRisk {
  id: string;
  categoria: string;
  nivelRisco: string;
  status: string;
  projeto: string;
  dataIdentificacao: string;
  responsavel: string;
  probabilidade: string;
  impacto: string;
}

const Reports = () => {
  const { risks, loading, profiles, projects } = useSupabaseRiskData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');

  // Converter dados do Supabase para formato do relatório
  const convertedRisks: ReportRisk[] = risks.map(risk => ({
    id: risk.id,
    categoria: risk.categoria,
    nivelRisco: risk.nivel_risco,
    status: risk.status,
    projeto: risk.projeto?.nome || 'Sem Projeto',
    dataIdentificacao: risk.data_identificacao,
    responsavel: risk.responsavel?.nome || 'Não atribuído',
    probabilidade: risk.probabilidade,
    impacto: risk.impacto
  }));

  const reportFilters = {
    startDate: dateRange?.from,
    endDate: dateRange?.to,
    category: categoryFilter,
    project: projectFilter,
    status: statusFilter,
    responsible: responsibleFilter
  };

  const {
    filteredRisks,
    monthlyTrends,
    categoryDistribution,
    statusDistribution,
    projectDistribution,
    metrics
  } = useReportData(convertedRisks, reportFilters);

  // Cores para os gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  const riskLevelColors = {
    'Crítico': '#DC2626',
    'Alto': '#EA580C', 
    'Médio': '#D97706',
    'Baixo': '#16A34A'
  };

  const exportToJSON = () => {
    const reportData = {
      periodo: {
        inicio: dateRange?.from?.toISOString().split('T')[0],
        fim: dateRange?.to?.toISOString().split('T')[0]
      },
      filtros: reportFilters,
      metricas: metrics,
      dados: {
        riscosFiltrados: filteredRisks,
        tendenciaMensal: monthlyTrends,
        distribuicaoCategoria: categoryDistribution,
        distribuicaoStatus: statusDistribution,
        distribuicaoProjeto: projectDistribution
      },
      geradoEm: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-riscos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado em JSON!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Relatórios de Riscos</h3>
          <p className="text-gray-600">
            Análise detalhada dos riscos identificados no período selecionado
          </p>
        </div>
        <Button onClick={exportToJSON} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {[...new Set(risks.map(r => r.categoria))].map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Projeto</label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.nome}>{project.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {[...new Set(risks.map(r => r.status))].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Responsável</label>
              <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.nome}>{profile.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Riscos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Riscos Críticos/Altos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.highRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Mitigação</p>
                <p className="text-2xl font-bold text-green-600">{metrics.mitigationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Monitoramento</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.mediumRisks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência Mensal de Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alto" stroke="#DC2626" name="Alto/Crítico" />
                <Line type="monotone" dataKey="medio" stroke="#D97706" name="Médio" />
                <Line type="monotone" dataKey="baixo" stroke="#16A34A" name="Baixo" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Riscos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alto" stackId="a" fill="#DC2626" name="Alto/Crítico" />
                <Bar dataKey="medio" stackId="a" fill="#D97706" name="Médio" />
                <Bar dataKey="baixo" stackId="a" fill="#16A34A" name="Baixo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Projetos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Projetos com Mais Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Textual */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Situação Atual</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• {metrics.totalRisks} riscos identificados no período</li>
                <li>• {metrics.highRisks} riscos de alta prioridade</li>
                <li>• {metrics.mitigationRate}% de taxa de mitigação</li>
                <li>• {filteredRisks.filter(r => r.status === 'Em Monitoramento').length} riscos em monitoramento ativo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Recomendações</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Priorizar {metrics.highRisks} riscos críticos/altos</li>
                <li>• Implementar planos de mitigação para riscos em aberto</li>
                <li>• Revisar riscos sem responsável definido</li>
                <li>• Monitorar tendências mensais para identificar padrões</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
