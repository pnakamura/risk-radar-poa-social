import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Briefcase, AlertTriangle, TrendingUp, Clock, Edit, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useRiskHistory } from '@/hooks/useRiskHistory';
import { useAuth } from '@/hooks/useAuth';
import { RiskEditModal } from '@/components/risk-management/RiskEditModal';
import { Loader2 } from 'lucide-react';

const RiskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { risks, loading: risksLoading, refreshData } = useSupabaseRiskData();
  const { variablesHistory, riskHistory, loading: historyLoading } = useRiskHistory(id || '');
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const risk = risks.find(r => r.id === id);

  // Verificar se o usuário pode editar o risco
  const canEditRisk = user && risk && (
    risk.criado_por === user.id || 
    user.role === 'admin' || 
    user.role === 'gestor'
  );

  const handleEditSuccess = () => {
    refreshData();
    setIsEditModalOpen(false);
  };

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
          <Link to="/matriz-riscos">
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
            <Link to="/matriz-riscos">
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
            {canEditRisk && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Risco
              </Button>
            )}
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

              <div>
                <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Última Atualização
                </h4>
                <p className="text-gray-600">
                  {new Date(risk.updated_at).toLocaleString('pt-BR')}
                </p>
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

        {/* Evolução do Risco */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Risco</CardTitle>
            <p className="text-sm text-muted-foreground">
              Histórico completo de mudanças nas variáveis do risco e ações administrativas
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
                <TabsTrigger value="analysis">Análise</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline">
                <div className="space-y-6">
                  {/* Timeline Integrado */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Histórico de Variáveis</h4>
                    {variablesHistory.map((entry, index) => (
                      <div key={entry.id} className="border-l-4 border-blue-500 pl-4 pb-4 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskLevelColor(entry.nivel_risco)}>
                              {entry.nivel_risco}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              por {entry.usuario?.nome || 'Sistema'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.data_snapshot).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="text-sm">
                            <span className="font-medium">Probabilidade:</span> {entry.probabilidade}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Impacto:</span> {entry.impacto}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Status:</span> 
                            <Badge variant="outline" className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                        </div>
                        {entry.observacoes && (
                          <p className="text-muted-foreground text-sm mt-2">{entry.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Ações Administrativas</h4>
                    {riskHistory.map((entry, index) => (
                      <div key={entry.id} className="border-l-4 border-gray-300 pl-4 pb-4 relative">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{entry.acao}</Badge>
                            <span className="text-sm text-muted-foreground">
                              por {entry.usuario?.nome || 'Sistema'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {entry.observacoes && (
                          <p className="text-muted-foreground text-sm">{entry.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total de Mudanças</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{variablesHistory.length}</div>
                      <p className="text-xs text-muted-foreground">
                        nas variáveis do risco
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {variablesHistory.length > 0 
                          ? Math.floor((new Date().getTime() - new Date(variablesHistory[0].data_snapshot).getTime()) / (1000 * 60 * 60 * 24))
                          : '-'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        dias atrás
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Tendência</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(() => {
                          if (variablesHistory.length < 2) return '-';
                          const latest = getRiskLevelValue(variablesHistory[0].nivel_risco);
                          const previous = getRiskLevelValue(variablesHistory[1].nivel_risco);
                          if (latest > previous) return '↗️';
                          if (latest < previous) return '↘️';
                          return '→';
                        })()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        evolução do nível
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Frequência</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {variablesHistory.length > 1 
                          ? Math.round(variablesHistory.length / ((new Date().getTime() - new Date(variablesHistory[variablesHistory.length - 1].data_snapshot).getTime()) / (1000 * 60 * 60 * 24 * 30)))
                          : '-'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        mudanças/mês
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="space-y-6">
                  {/* Distribuição de Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição de Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(
                          variablesHistory.reduce((acc, entry) => {
                            acc[entry.status] = (acc[entry.status] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getStatusColor(status)}>
                                {status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${(count / variablesHistory.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Insights e Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const insights = [];
                          
                          // Verificar se o risco não é atualizado há muito tempo
                          if (variablesHistory.length > 0) {
                            const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(variablesHistory[0].data_snapshot).getTime()) / (1000 * 60 * 60 * 24));
                            if (daysSinceUpdate > 30) {
                              insights.push({
                                type: 'warning',
                                title: 'Risco desatualizado',
                                description: `Este risco não é revisado há ${daysSinceUpdate} dias. Considere uma reavaliação.`
                              });
                            }
                          }

                          // Verificar tendência de deterioração
                          if (variablesHistory.length >= 3) {
                            const recent3 = variablesHistory.slice(0, 3);
                            const isWorsening = recent3.every((entry, index) => {
                              if (index === 0) return true;
                              return getRiskLevelValue(entry.nivel_risco) >= getRiskLevelValue(recent3[index - 1].nivel_risco);
                            });
                            
                            if (isWorsening) {
                              insights.push({
                                type: 'danger',
                                title: 'Tendência de deterioração',
                                description: 'O risco apresenta tendência de piora nas últimas avaliações. Ações urgentes podem ser necessárias.'
                              });
                            }
                          }

                          // Verificar estabilidade
                          if (variablesHistory.length >= 5) {
                            const recent5 = variablesHistory.slice(0, 5);
                            const isStable = recent5.every(entry => entry.nivel_risco === recent5[0].nivel_risco);
                            
                            if (isStable) {
                              insights.push({
                                type: 'success',
                                title: 'Risco estável',
                                description: 'O risco mantém nível consistente nas últimas avaliações, indicando boa gestão.'
                              });
                            }
                          }

                          if (insights.length === 0) {
                            insights.push({
                              type: 'info',
                              title: 'Análise em andamento',
                              description: 'Dados insuficientes para gerar insights automatizados. Continue monitorando.'
                            });
                          }

                          return insights;
                        })().map((insight, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${
                            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            insight.type === 'danger' ? 'bg-red-50 border-red-200' :
                            insight.type === 'success' ? 'bg-green-50 border-green-200' :
                            'bg-blue-50 border-blue-200'
                          }`}>
                            <h5 className="font-medium text-sm mb-1">{insight.title}</h5>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <RiskEditModal
        risk={risk}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default RiskDetail;