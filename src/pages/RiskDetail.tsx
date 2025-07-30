import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Briefcase, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useRiskHistory } from '@/hooks/useRiskHistory';
import { Loader2 } from 'lucide-react';

const RiskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { risks, loading: risksLoading } = useSupabaseRiskData();
  const { variablesHistory, riskHistory, loading: historyLoading } = useRiskHistory(id || '');

  const risk = risks.find(r => r.id === id);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Baixo': return 'bg-green-500';
      case 'Médio': return 'bg-yellow-500';
      case 'Alto': return 'bg-orange-500';
      case 'Crítico': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado': return 'bg-blue-500';
      case 'Em Análise': return 'bg-yellow-500';
      case 'Em Tratamento': return 'bg-orange-500';
      case 'Mitigado': return 'bg-green-500';
      case 'Aceito': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelValue = (level: string) => {
    switch (level) {
      case 'Baixo': return 1;
      case 'Médio': return 2;
      case 'Alto': return 3;
      case 'Crítico': return 4;
      default: return 0;
    }
  };

  const getProbabilityValue = (prob: string) => {
    switch (prob) {
      case 'Muito Baixo': return 1;
      case 'Baixo': return 2;
      case 'Médio': return 3;
      case 'Alto': return 4;
      case 'Muito Alto': return 5;
      default: return 0;
    }
  };

  const getImpactValue = (impact: string) => {
    switch (impact) {
      case 'Muito Baixo': return 1;
      case 'Baixo': return 2;
      case 'Médio': return 3;
      case 'Alto': return 4;
      case 'Muito Alto': return 5;
      default: return 0;
    }
  };

  // Preparar dados para os gráficos
  const chartData = variablesHistory.map(entry => ({
    date: new Date(entry.data_snapshot).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    }),
    timestamp: entry.data_snapshot,
    nivelRisco: getRiskLevelValue(entry.nivel_risco),
    probabilidade: getProbabilityValue(entry.probabilidade),
    impacto: getImpactValue(entry.impacto),
  })).reverse(); // Reverter para ordem cronológica

  if (risksLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando detalhes do risco...</p>
        </div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Risco não encontrado</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à matriz de riscos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Risco {risk.codigo}
              </h1>
              <p className="text-gray-600 mt-1">{risk.descricao_risco}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${getRiskLevelColor(risk.nivel_risco)} text-white`}>
              {risk.nivel_risco}
            </Badge>
            <Badge className={`${getStatusColor(risk.status)} text-white`}>
              {risk.status}
            </Badge>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Informações do Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Categoria</h4>
                  <p className="text-gray-600">{risk.categoria}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Estratégia</h4>
                  <p className="text-gray-600">{risk.estrategia}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Probabilidade</h4>
                  <p className="text-gray-600">{risk.probabilidade}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Impacto</h4>
                  <p className="text-gray-600">{risk.impacto}</p>
                </div>
              </div>
              
              <Separator />
              
              {risk.causas && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Causas</h4>
                  <p className="text-gray-600">{risk.causas}</p>
                </div>
              )}
              
              {risk.consequencias && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Consequências</h4>
                  <p className="text-gray-600">{risk.consequencias}</p>
                </div>
              )}
              
              {risk.acoes_mitigacao && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ações de Mitigação</h4>
                  <p className="text-gray-600">{risk.acoes_mitigacao}</p>
                </div>
              )}
              
              {risk.acoes_contingencia && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ações de Contingência</h4>
                  <p className="text-gray-600">{risk.acoes_contingencia}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Responsabilidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Responsável</h4>
                <p className="text-gray-600">{risk.responsavel?.nome || 'Não definido'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Projeto</h4>
                <p className="text-gray-600">{risk.projeto?.nome || 'Não definido'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Criado por</h4>
                <p className="text-gray-600">{risk.criador?.nome || 'N/A'}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Identificação
                </h4>
                <p className="text-gray-600">
                  {new Date(risk.data_identificacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {risk.prazo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Prazo
                  </h4>
                  <p className="text-gray-600">
                    {new Date(risk.prazo).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Evolução */}
        {chartData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Evolução das Variáveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip 
                      labelFormatter={(value) => `Data: ${value}`}
                      formatter={(value, name) => {
                        const labels = {
                          nivelRisco: 'Nível do Risco',
                          probabilidade: 'Probabilidade', 
                          impacto: 'Impacto'
                        };
                        const valueLabels = {
                          1: name === 'nivelRisco' ? 'Baixo' : 'Muito Baixo',
                          2: name === 'nivelRisco' ? 'Médio' : 'Baixo',
                          3: name === 'nivelRisco' ? 'Alto' : 'Médio',
                          4: name === 'nivelRisco' ? 'Crítico' : 'Alto',
                          5: 'Muito Alto'
                        };
                        return [valueLabels[value as keyof typeof valueLabels], labels[name as keyof typeof labels]];
                      }}
                    />
                    <Line type="monotone" dataKey="nivelRisco" stroke="#ef4444" strokeWidth={2} name="nivelRisco" />
                    <Line type="monotone" dataKey="probabilidade" stroke="#3b82f6" strokeWidth={2} name="probabilidade" />
                    <Line type="monotone" dataKey="impacto" stroke="#f59e0b" strokeWidth={2} name="impacto" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Alterações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskHistory.map((entry, index) => (
                <div key={entry.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.acao}</Badge>
                      <span className="text-sm text-gray-600">
                        por {entry.usuario?.nome || 'Sistema'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {entry.observacoes && (
                    <p className="text-gray-600 text-sm">{entry.observacoes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskDetail;