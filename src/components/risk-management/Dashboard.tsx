import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, ExternalLink, Filter } from 'lucide-react';
import { RiskHealthScore } from '@/components/dashboard/RiskHealthScore';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

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
  
  // State para filtro de projeto
  const [selectedProject, setSelectedProject] = React.useState<string>("");
  
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
    const params = new URLSearchParams();
    
    switch (filterType) {
      case 'critical-high':
        params.set('level', 'Crítico,Alto');
        break;
      case 'mitigated':
        params.set('status', 'Mitigado');
        break;
      case 'monitoring':
        params.set('level', 'Médio');
        break;
      case 'total':
        // Sem filtros para mostrar todos
        break;
      default:
        if (filterValue) {
          params.set(filterType, filterValue);
        }
    }
    
    navigate(`/?tab=matrix&${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calcular métricas baseadas nos riscos reais
  const totalRisks = risks.length;
  const highRisks = risks.filter(r => r.nivel_risco === 'Alto' || r.nivel_risco === 'Crítico').length;
  const mediumRisks = risks.filter(r => r.nivel_risco === 'Médio').length;
  const lowRisks = risks.filter(r => r.nivel_risco === 'Baixo').length;
  const mitigatedRisks = risks.filter(r => r.status === 'Mitigado').length;

  // Dados para gráficos
  const riskByCategory = risks.reduce((acc, risk) => {
    acc[risk.categoria] = (acc[risk.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(riskByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const riskByLevel = [
    { name: 'Crítico', value: risks.filter(r => r.nivel_risco === 'Crítico').length, color: '#DC2626' },
    { name: 'Alto', value: risks.filter(r => r.nivel_risco === 'Alto').length, color: '#EA580C' },
    { name: 'Médio', value: risks.filter(r => r.nivel_risco === 'Médio').length, color: '#D97706' },
    { name: 'Baixo', value: risks.filter(r => r.nivel_risco === 'Baixo').length, color: '#16A34A' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2">Dashboard de Riscos</h3>
          <p className="text-gray-600">
            Visão geral dos riscos identificados e métricas principais
          </p>
        </div>
        
        {/* Filtro de Projeto */}
        {availableProjects.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedProject || "all"} onValueChange={(value) => setSelectedProject(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os projetos" />
              </SelectTrigger>
              <SelectContent>
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

      {/* Risk Health Score e Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskHealthScore 
          risks={risks} 
          selectedProject={selectedProject || undefined}
        />
        <ActivityTimeline risks={risks} />
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 interactive-card"
          onClick={() => handleCardClick('total')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Riscos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para ver todos</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 interactive-card"
          onClick={() => handleCardClick('critical-high')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Riscos Críticos/Altos</p>
                  <p className="text-2xl font-bold text-red-600">{highRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para filtrar</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 interactive-card"
          onClick={() => handleCardClick('mitigated')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Riscos Mitigados</p>
                  <p className="text-2xl font-bold text-green-600">{mitigatedRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para filtrar</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 interactive-card"
          onClick={() => handleCardClick('monitoring')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Monitoramento</p>
                  <p className="text-2xl font-bold text-yellow-600">{mediumRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique para filtrar</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Riscos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Nível de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
