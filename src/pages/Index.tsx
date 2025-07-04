
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/risk-management/Dashboard';
import RiskMatrix from '@/components/risk-management/RiskMatrix';
import Reports from '@/components/risk-management/Reports';
import RiskForm from '@/components/risk-management/RiskForm';
import { UserMenu } from '@/components/layout/UserMenu';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Shield, TrendingUp, FileBarChart } from 'lucide-react';

const Index = () => {
  const { risks, loading, refreshData } = useSupabaseRiskData();
  const { profile } = useAuth();

  console.log('Index - Raw risks data:', risks);

  // Mapear os dados do Supabase para o formato esperado pelos componentes
  const mappedRisks = risks.map(risk => {
    const mappedRisk = {
      id: risk.id,
      codigo: risk.codigo,
      categoria: risk.categoria,
      descricaoRisco: risk.descricao_risco,
      causas: risk.causas || '',
      consequencias: risk.consequencias || '',
      probabilidade: risk.probabilidade,
      impacto: risk.impacto,
      nivelRisco: risk.nivel_risco,
      estrategia: risk.estrategia,
      acoesMitigacao: risk.acoes_mitigacao || '',
      acoesContingencia: risk.acoes_contingencia || '',
      responsavel: risk.responsavel?.nome || '',
      prazo: risk.prazo || '',
      status: risk.status,
      observacoes: risk.observacoes || '',
      dataIdentificacao: risk.data_identificacao,
      projeto: risk.projeto?.nome || '',
      criadoPor: risk.criador?.nome || '',
      createdAt: risk.created_at,
      updatedAt: risk.updated_at
    };
    
    console.log('Mapped risk:', mappedRisk);
    return mappedRisk;
  });

  console.log('Index - Mapped risks:', mappedRisks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Matriz de Risco do Programa - POA+SOCIAL
                </h1>
                <p className="text-gray-600 mt-1">
                  Sistema de Gestão de Riscos conforme ISO 31000
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Bem-vindo,</p>
                  <p className="font-medium">{profile.nome}</p>
                </div>
              )}
              <UserMenu />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Riscos Críticos/Altos</p>
                    <p className="text-2xl font-bold text-red-700">
                      {mappedRisks.filter(r => r.nivelRisco === 'Alto' || r.nivelRisco === 'Crítico').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Riscos Médios</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {mappedRisks.filter(r => r.nivelRisco === 'Médio').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Riscos Baixos</p>
                    <p className="text-2xl font-bold text-green-700">
                      {mappedRisks.filter(r => r.nivelRisco === 'Baixo').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total de Riscos</p>
                    <p className="text-2xl font-bold text-blue-700">{mappedRisks.length}</p>
                  </div>
                  <FileBarChart className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-lg p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Matriz de Riscos
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileBarChart className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Gerenciar Riscos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard risks={mappedRisks} loading={loading} />
          </TabsContent>

          <TabsContent value="matrix">
            <RiskMatrix risks={mappedRisks} loading={loading} />
          </TabsContent>

          <TabsContent value="reports">
            <Reports risks={mappedRisks} loading={loading} />
          </TabsContent>

          <TabsContent value="form">
            <RiskForm onSuccess={refreshData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
