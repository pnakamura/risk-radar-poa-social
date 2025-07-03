
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, TrendingUp, Shield, Calendar } from 'lucide-react';

interface Risk {
  categoria: string;
  nivelRisco: string;
  status: string;
  projeto: string;
  dataIdentificacao: string;
}

interface DashboardProps {
  risks: Risk[];
  loading: boolean;
}

const Dashboard = ({ risks, loading }: DashboardProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Dados para gráficos
  const riskByCategory = risks.reduce((acc, risk) => {
    acc[risk.categoria] = (acc[risk.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(riskByCategory).map(([name, value]) => ({
    name,
    value,
    total: risks.length
  }));

  const riskByLevel = risks.reduce((acc, risk) => {
    acc[risk.nivelRisco] = (acc[risk.nivelRisco] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const levelData = Object.entries(riskByLevel).map(([name, value]) => ({
    name,
    value
  }));

  const riskByProject = risks.reduce((acc, risk) => {
    acc[risk.projeto] = (acc[risk.projeto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectData = Object.entries(riskByProject).map(([name, value]) => ({
    name,
    value
  }));

  const statusData = risks.reduce((acc, risk) => {
    acc[risk.status] = (acc[risk.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = {
    'Alto': '#ef4444',
    'Médio': '#f59e0b',
    'Baixo': '#10b981',
    'Tecnologia': '#3b82f6',
    'Recursos Humanos': '#8b5cf6',
    'Financeiro': '#f59e0b',
    'Operacional': '#10b981',
    'Compliance': '#ef4444'
  };

  const getColor = (name: string) => COLORS[name as keyof typeof COLORS] || '#6b7280';

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Taxa de Mitigação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((risks.filter(r => r.status === 'Mitigado').length / risks.length) * 100) || 0}%
            </div>
            <p className="text-blue-100 text-sm mt-1">
              {risks.filter(r => r.status === 'Mitigado').length} de {risks.length} riscos mitigados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Riscos Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {risks.filter(r => r.nivelRisco === 'Alto').length}
            </div>
            <p className="text-amber-100 text-sm mt-1">
              Requerem ação imediata
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Índice de Controle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(((risks.filter(r => r.status === 'Monitorado' || r.status === 'Mitigado').length) / risks.length) * 100) || 0}%
            </div>
            <p className="text-green-100 text-sm mt-1">
              Riscos sob controle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Riscos por Nível */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Distribuição por Nível de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {levelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Riscos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Riscos por Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Riscos por Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Riscos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Status dos Riscos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
