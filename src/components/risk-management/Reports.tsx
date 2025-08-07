import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileDown, Calendar, Filter, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ExportModal } from './ExportModal';
import { DateRange } from 'react-day-picker';
import { Database } from '@/integrations/supabase/types';
import { useGlobalFilters } from '@/context/GlobalFilterContext';

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
  const { filters, setFilter } = useGlobalFilters();
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>();
  const [reportType, setReportType] = useState<'overview' | 'trends' | 'detailed'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredRisks = risks
    .filter(risk => {
      const selectedProject = filters.project || 'all';
      const selectedCategory = filters.category || 'all';
      const matchesProject = selectedProject === 'all' || risk.projeto?.nome === selectedProject;
      const matchesCategory = selectedCategory === 'all' || risk.categoria === selectedCategory;
      
      let matchesPeriod = true;
      if (selectedPeriod?.from && selectedPeriod?.to) {
        const riskDate = new Date(risk.data_identificacao);
        matchesPeriod = riskDate >= selectedPeriod.from && riskDate <= selectedPeriod.to;
      }
      
      return matchesProject && matchesCategory && matchesPeriod;
    });

  // Preparar dados para gráficos
  const risksByLevel = [
    { name: 'Crítico', value: filteredRisks.filter(r => r.nivel_risco === 'Crítico').length, color: 'hsl(var(--risk-critical))' },
    { name: 'Alto', value: filteredRisks.filter(r => r.nivel_risco === 'Alto').length, color: 'hsl(25 95% 53%)' },
    { name: 'Médio', value: filteredRisks.filter(r => r.nivel_risco === 'Médio').length, color: 'hsl(45 93% 47%)' },
    { name: 'Baixo', value: filteredRisks.filter(r => r.nivel_risco === 'Baixo').length, color: 'hsl(var(--risk-excellent))' }
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

  // Dados para tendências (últimos 6 meses)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    
    const risksInMonth = filteredRisks.filter(risk => {
      const riskDate = new Date(risk.data_identificacao);
      return riskDate.getMonth() === date.getMonth() && riskDate.getFullYear() === date.getFullYear();
    }).length;
    
    return { month: monthName, risks: risksInMonth };
  });

  const projects = [...new Set(risks.map(r => r.projeto?.nome).filter(Boolean))];
  const categories = [...new Set(risks.map(r => r.categoria).filter(Boolean))];

  const handleExport = () => {
    setShowExportModal(true);
  };

  const getAppliedFilters = () => ({
    'Período': selectedPeriod,
    'Projeto': filters.project || 'Todos',
    'Categoria': filters.category || 'Todas',
    'Tipo de Relatório': reportType
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Relatórios de Riscos</h3>
          <p className="text-gray-600">
            Análise baseada em {filteredRisks.length} de {risks.length} riscos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
              <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={(value: 'overview' | 'trends' | 'detailed') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Visão Geral</SelectItem>
                  <SelectItem value="trends">Tendências</SelectItem>
                  <SelectItem value="detailed">Detalhado</SelectItem>
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={risksByLevel}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {risksByLevel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={risksByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={risksByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--risk-excellent))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{filteredRisks.length}</div>
                      <div className="text-sm text-gray-600">Total de Riscos</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredRisks.filter(r => r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto').length}
                      </div>
                      <div className="text-sm text-gray-600">Riscos Críticos/Altos</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      Este relatório apresenta uma visão geral dos riscos identificados, 
                      com foco na distribuição por nível de criticidade e categoria.
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
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="risks" stroke="#8884d8" name="Novos Riscos" />
                  </LineChart>
                </ResponsiveContainer>
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
                <div className="space-y-4">
                  {filteredRisks.map((risk, index) => (
                    <div key={risk.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{risk.codigo} - {risk.descricao_risco}</h4>
                          <p className="text-sm text-gray-600">Categoria: {risk.categoria}</p>
                          <p className="text-sm text-gray-600">Nível: {risk.nivel_risco}</p>
                          <p className="text-sm text-gray-600">Status: {risk.status}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Criado em: {new Date(risk.data_identificacao).toLocaleDateString('pt-BR')}</p>
                          <p>Responsável: {risk.responsavel?.nome || 'Não atribuído'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default Reports;
