import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileBarChart, Download, Calendar, TrendingUp, Filter, CalendarDays } from 'lucide-react';
import { useReportData } from '@/hooks/useReportData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Risk {
  categoria: string;
  nivelRisco: string;
  status: string;
  projeto: string;
  dataIdentificacao: string;
  responsavel: string;
  probabilidade: string;
  impacto: string;
}

interface ReportsProps {
  risks: Risk[];
  loading: boolean;
}

const Reports = ({ risks, loading }: ReportsProps) => {
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('last6months');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    category: 'all',
    project: 'all',
    status: 'all',
    responsible: 'all'
  });

  // Calcular datas baseadas no range selecionado
  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'last30days':
        return { startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30), endDate: now };
      case 'last3months':
        return { startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1), endDate: now };
      case 'last6months':
        return { startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1), endDate: now };
      case 'lastyear':
        return { startDate: new Date(now.getFullYear() - 1, 0, 1), endDate: now };
      case 'custom':
        return { startDate: filters.startDate, endDate: filters.endDate };
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  const dateRange = getDateRange(timeRange);
  const reportFilters = {
    ...filters,
    ...dateRange
  };

  const {
    filteredRisks,
    monthlyTrends,
    categoryDistribution,
    statusDistribution,
    projectDistribution,
    metrics
  } = useReportData(risks, reportFilters);

  // Obter valores únicos para filtros
  const categories = [...new Set(risks.map(r => r.categoria).filter(Boolean))];
  const projects = [...new Set(risks.map(r => r.projeto).filter(Boolean))];
  const responsibles = [...new Set(risks.map(r => r.responsavel).filter(Boolean))];

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateReport = () => {
    const reportData = {
      geradoEm: new Date().toLocaleDateString('pt-BR'),
      tipoRelatorio: reportType,
      periodo: timeRange,
      filtros: reportFilters,
      metricas: metrics,
      riscos: filteredRisks
    };
    
    console.log('Dados do relatório:', reportData);
    
    // Simular download (em produção, implementar geração real de PDF/Excel)
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-riscos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Relatório gerado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Controles de Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5" />
              Configuração de Relatórios
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Relatório" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumo Executivo</SelectItem>
                  <SelectItem value="detailed">Relatório Detalhado</SelectItem>
                  <SelectItem value="trends">Análise de Tendências</SelectItem>
                  <SelectItem value="compliance">Compliance ISO 31000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="last6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="lastyear">Último ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeRange === 'custom' && (
              <>
                <div>
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={filters.startDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      startDate: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={filters.endDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      endDate: e.target.value ? new Date(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </>
            )}

            <Button onClick={generateReport} className="flex items-center gap-2 self-end">
              <Download className="w-4 h-4" />
              Gerar Relatório
            </Button>
          </div>

          {/* Filtros Avançados */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Categoria</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Projeto</Label>
                  <Select value={filters.project} onValueChange={(value) => setFilters(prev => ({ ...prev, project: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project} value={project}>{project}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Identificado">Identificado</SelectItem>
                      <SelectItem value="Em Análise">Em Análise</SelectItem>
                      <SelectItem value="Em Monitoramento">Em Monitoramento</SelectItem>
                      <SelectItem value="Mitigado">Mitigado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Responsável</Label>
                  <Select value={filters.responsible} onValueChange={(value) => setFilters(prev => ({ ...prev, responsible: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {responsibles.map(responsible => (
                        <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Métricas de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{metrics.totalRisks}</div>
              <div className="text-sm text-blue-600">Total de Riscos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{metrics.highRisks}</div>
              <div className="text-sm text-red-600">Riscos Altos/Críticos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">{metrics.mediumRisks}</div>
              <div className="text-sm text-yellow-600">Riscos Médios</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{metrics.lowRisks}</div>
              <div className="text-sm text-green-600">Riscos Baixos</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{metrics.mitigationRate}%</div>
              <div className="text-sm text-purple-600">Taxa Mitigação</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Relatório */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendência de Riscos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Tendência de Riscos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="alto" stroke="#EF4444" strokeWidth={3} name="Alto/Crítico" />
                <Line type="monotone" dataKey="medio" stroke="#F59E0B" strokeWidth={3} name="Médio" />
                <Line type="monotone" dataKey="baixo" stroke="#10B981" strokeWidth={3} name="Baixo" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Status dos Riscos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
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

        {/* Riscos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Análise por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="alto" stackId="a" fill="#EF4444" name="Alto/Crítico" />
                <Bar dataKey="medio" stackId="a" fill="#F59E0B" name="Médio" />
                <Bar dataKey="baixo" stackId="a" fill="#10B981" name="Baixo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Riscos por Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Projetos por Riscos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo - Gestão de Riscos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Principais Indicadores</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Total de riscos identificados: <Badge variant="outline">{metrics.totalRisks}</Badge></li>
                  <li>• Riscos de alto impacto: <Badge variant="destructive">{metrics.highRisks}</Badge></li>
                  <li>• Taxa de mitigação: <Badge variant="default">{metrics.mitigationRate}%</Badge></li>
                  <li>• Categoria mais crítica: <Badge variant="secondary">{categoryDistribution.sort((a, b) => b.alto - a.alto)[0]?.name || 'N/A'}</Badge></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Priorizar ações para riscos de nível alto</li>
                  <li>• Implementar monitoramento contínuo</li>
                  <li>• Revisar estratégias de mitigação mensalmente</li>
                  <li>• Fortalecer comunicação entre projetos</li>
                </ul>
              </div>
            </div>

            {filteredRisks.length !== risks.length && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Filtros aplicados:</strong> Exibindo {filteredRisks.length} de {risks.length} riscos com base nos filtros selecionados.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
