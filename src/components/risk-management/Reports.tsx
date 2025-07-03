
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileBarChart, Download, Calendar, TrendingUp } from 'lucide-react';

interface Risk {
  categoria: string;
  nivelRisco: string;
  status: string;
  projeto: string;
  dataIdentificacao: string;
}

interface ReportsProps {
  risks: Risk[];
  loading: boolean;
}

const Reports = ({ risks, loading }: ReportsProps) => {
  const [reportType, setReportType] = useState('summary');
  const [timeRange, setTimeRange] = useState('monthly');

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

  // Dados para relatórios
  const riskTrends = [
    { month: 'Jan', alto: 2, medio: 5, baixo: 3 },
    { month: 'Fev', alto: 3, medio: 4, baixo: 4 },
    { month: 'Mar', alto: 1, medio: 6, baixo: 5 },
    { month: 'Abr', alto: 4, medio: 3, baixo: 6 },
    { month: 'Mai', alto: 2, medio: 7, baixo: 4 },
    { month: 'Jun', alto: 5, medio: 2, baixo: 7 },
    { month: 'Jul', alto: 3, medio: 5, baixo: 5 }
  ];

  const categoryComparison = risks.reduce((acc, risk) => {
    acc[risk.categoria] = {
      name: risk.categoria,
      total: (acc[risk.categoria]?.total || 0) + 1,
      alto: (acc[risk.categoria]?.alto || 0) + (risk.nivelRisco === 'Alto' ? 1 : 0),
      medio: (acc[risk.categoria]?.medio || 0) + (risk.nivelRisco === 'Médio' ? 1 : 0),
      baixo: (acc[risk.categoria]?.baixo || 0) + (risk.nivelRisco === 'Baixo' ? 1 : 0)
    };
    return acc;
  }, {} as Record<string, any>);

  const categoryData = Object.values(categoryComparison);

  const projectRisks = risks.reduce((acc, risk) => {
    acc[risk.projeto] = (acc[risk.projeto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectData = Object.entries(projectRisks).map(([name, value]) => ({
    name,
    value
  }));

  const statusDistribution = risks.reduce((acc, risk) => {
    acc[risk.status] = (acc[risk.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

  const generateReport = () => {
    const reportData = {
      geradoEm: new Date().toLocaleDateString('pt-BR'),
      tipoRelatorio: reportType,
      periodo: timeRange,
      totalRiscos: risks.length,
      riscosAlto: risks.filter(r => r.nivelRisco === 'Alto').length,
      riscosMedio: risks.filter(r => r.nivelRisco === 'Médio').length,
      riscosBaixo: risks.filter(r => r.nivelRisco === 'Baixo').length,
      riscos: risks
    };
    
    console.log('Gerando relatório:', reportData);
    // Aqui seria implementada a lógica de geração de PDF/Excel
    alert('Relatório gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <div className="space-y-6">
      {/* Controles de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            Configuração de Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="biannual">Semestral</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={generateReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{risks.length}</div>
              <div className="text-sm text-blue-600">Total de Riscos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {risks.filter(r => r.nivelRisco === 'Alto').length}
              </div>
              <div className="text-sm text-red-600">Riscos Altos</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {risks.filter(r => r.nivelRisco === 'Médio').length}
              </div>
              <div className="text-sm text-yellow-600">Riscos Médios</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {Math.round((risks.filter(r => r.status === 'Mitigado').length / risks.length) * 100) || 0}%
              </div>
              <div className="text-sm text-green-600">Taxa Mitigação</div>
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
              <LineChart data={riskTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="alto" stroke="#EF4444" strokeWidth={3} name="Alto" />
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
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
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
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="alto" stackId="a" fill="#EF4444" name="Alto" />
                <Bar dataKey="medio" stackId="a" fill="#F59E0B" name="Médio" />
                <Bar dataKey="baixo" stackId="a" fill="#10B981" name="Baixo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Riscos por Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
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
                  <li>• Total de riscos identificados: <strong>{risks.length}</strong></li>
                  <li>• Riscos de alto impacto: <strong>{risks.filter(r => r.nivelRisco === 'Alto').length}</strong></li>
                  <li>• Taxa de mitigação: <strong>{Math.round((risks.filter(r => r.status === 'Mitigado').length / risks.length) * 100) || 0}%</strong></li>
                  <li>• Categoria mais crítica: <strong>{Object.entries(categoryComparison).sort((a, b) => b[1].alto - a[1].alto)[0]?.[0] || 'N/A'}</strong></li>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
