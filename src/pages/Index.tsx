

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/risk-management/Dashboard';
import RiskMatrix from '@/components/risk-management/RiskMatrix';
import Reports from '@/components/risk-management/Reports';
import RiskForm from '@/components/risk-management/RiskForm';
import MasterDataTabs from '@/components/master-data/MasterDataTabs';
import { UserMenu } from '@/components/layout/UserMenu';
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Shield, TrendingUp, FileBarChart, Database, Users } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Index = () => {
  const { risks, loading, refreshData } = useSupabaseRiskData();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Obter aba ativa da URL, padrão é "dashboard"
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Função para navegar entre as abas
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  console.log('Index - Raw risks data:', risks);

  const handleSearchResult = (risk: any) => {
    // Navegar para a página de detalhes do risco ou abrir modal
    navigate(`/risco/${risk.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-blue-600 rounded-lg hover-glow">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  Matriz de Risco do Programa - POA+SOCIAL
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Sistema de Gestão de Riscos conforme ISO 31000
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Busca Global */}
              <div className="hidden sm:block">
                <GlobalSearch 
                  risks={risks} 
                  onResultClick={handleSearchResult}
                  placeholder="Buscar riscos..."
                />
              </div>
              
              {profile && (
                <div className="text-right hidden lg:block">
                  <p className="text-sm text-gray-600">Bem-vindo,</p>
                  <p className="font-medium">{profile.nome}</p>
                </div>
              )}
              <UserMenu />
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <SmartBreadcrumbs risks={risks} currentTab={activeTab} />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-xs sm:text-sm font-medium">Riscos Críticos/Altos</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-700">
                      {risks.filter(r => r.nivel_risco === 'Alto' || r.nivel_risco === 'Crítico').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-xs sm:text-sm font-medium">Riscos Médios</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-700">
                      {risks.filter(r => r.nivel_risco === 'Médio').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-xs sm:text-sm font-medium">Riscos Baixos</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">
                      {risks.filter(r => r.nivel_risco === 'Baixo').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-xs sm:text-sm font-medium">Total de Riscos</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">{risks.length}</p>
                  </div>
                  <FileBarChart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-lg rounded-lg p-1 h-auto">
            <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden text-xs">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Matriz de Riscos</span>
              <span className="sm:hidden text-xs">Matriz</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <FileBarChart className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden text-xs">Relat.</span>
            </TabsTrigger>
            <TabsTrigger value="form" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Gerenciar Riscos</span>
              <span className="sm:hidden text-xs">Ger.</span>
            </TabsTrigger>
            <TabsTrigger value="master-data" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Database className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Dados Mestres</span>
              <span className="sm:hidden text-xs">Dados</span>
            </TabsTrigger>
            {(profile?.role === 'admin' || profile?.role === 'gestor') && (
              <TabsTrigger 
                value="users" 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
                onClick={() => navigate('/usuarios')}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Usuários</span>
                <span className="sm:hidden text-xs">Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard risks={risks} loading={loading} />
          </TabsContent>

          <TabsContent value="matrix">
            <RiskMatrix risks={risks} loading={loading} onRefresh={refreshData} />
          </TabsContent>

          <TabsContent value="reports">
            <Reports risks={risks} loading={loading} />
          </TabsContent>

          <TabsContent value="form">
            <RiskForm onSuccess={refreshData} />
          </TabsContent>

          <TabsContent value="master-data">
            <MasterDataTabs onSuccess={refreshData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

