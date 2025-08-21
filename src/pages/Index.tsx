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
import { AlertTriangle, Shield, TrendingUp, FileBarChart, Database, Users, Search as SearchIcon, HelpCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlobalFilterProvider } from '@/context/GlobalFilterContext';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
const Index = () => {
  const {
    risks,
    loading,
    refreshData
  } = useSupabaseRiskData();
  const {
    profile
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Obter aba ativa da URL, padrão é "dashboard"
  const activeTab = searchParams.get('tab') || 'dashboard';

  // Função para navegar entre as abas
  const handleTabChange = (value: string) => {
    setSearchParams({
      tab: value
    });
  };
  
  const handleSearchResult = (risk: any) => {
    // Navegar para a página de detalhes do risco ou abrir modal
    navigate(`/risco/${risk.id}`);
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-3 sm:p-6">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between py-2 sm:py-3">
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="p-1.5 sm:p-3 bg-blue-600 rounded-lg hover-glow">
                <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">Matriz de Riscos DPF</h1>
                <p className="text-xs sm:text-base text-gray-600 leading-tight hidden xs:block">
                  Sistema de Gestão de Riscos conforme ISO 31000
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Busca Global */}
              <div className="hidden sm:block">
                <GlobalSearch risks={risks} onResultClick={handleSearchResult} placeholder="Buscar riscos..." />
              </div>
              {/* Mobile Search */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Abrir busca">
                    <SearchIcon className="w-5 h-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Buscar</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4">
                    <GlobalSearch risks={risks} onResultClick={handleSearchResult} placeholder="Buscar riscos..." />
                  </div>
                </DrawerContent>
              </Drawer>
              {profile && <div className="text-right hidden lg:block">
                  <p className="text-sm text-gray-600">Bem-vindo,</p>
                  <p className="font-medium">{profile.nome}</p>
                </div>}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/ajuda')}
                aria-label="Central de Ajuda"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>
        
        {/* Breadcrumbs */}
        <SmartBreadcrumbs risks={risks} currentTab={activeTab} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden bg-white shadow-lg rounded-lg p-1 h-auto gap-1">
              <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-h-[60px] sm:min-h-[auto]">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden text-[10px]">Dash</span>
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-h-[60px] sm:min-h-[auto]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Matriz de Riscos</span>
                <span className="sm:hidden text-[10px]">Matriz</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-h-[60px] sm:min-h-[auto]">
                <FileBarChart className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Relatórios</span>
                <span className="sm:hidden text-[10px]">Relat.</span>
              </TabsTrigger>
              <TabsTrigger value="form" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-h-[60px] sm:min-h-[auto]">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Gerenciar Riscos</span>
                <span className="sm:hidden text-[10px]">Ger.</span>
              </TabsTrigger>
              <TabsTrigger value="master-data" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-h-[60px] sm:min-h-[auto]">
                <Database className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Dados Mestres</span>
                <span className="sm:hidden text-[10px]">Dados</span>
              </TabsTrigger>
              {(profile?.role === 'admin' || profile?.role === 'gestor') && 
                <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm min-h-[60px] sm:min-h-[auto]" onClick={() => navigate('/usuarios')}>
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Usuários</span>
                  <span className="sm:hidden text-[10px]">Users</span>
                </TabsTrigger>
              }
          </TabsList>

          <TabsContent value="dashboard">
            <GlobalFilterProvider>
              <Dashboard risks={risks} loading={loading} />
            </GlobalFilterProvider>
          </TabsContent>

          <TabsContent value="matrix">
            <GlobalFilterProvider>
              <RiskMatrix risks={risks} loading={loading} onRefresh={refreshData} />
            </GlobalFilterProvider>
          </TabsContent>

          <TabsContent value="reports">
            <GlobalFilterProvider>
              <Reports risks={risks} loading={loading} />
            </GlobalFilterProvider>
          </TabsContent>

          <TabsContent value="form">
            <RiskForm onSuccess={refreshData} />
          </TabsContent>

          <TabsContent value="master-data">
            <MasterDataTabs onSuccess={refreshData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Index;