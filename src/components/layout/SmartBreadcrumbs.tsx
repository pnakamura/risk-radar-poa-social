import React from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, FileBarChart, Shield, Database, Users, Plus } from 'lucide-react';

interface SmartBreadcrumbsProps {
  risks?: any[];
  currentTab?: string;
}

export const SmartBreadcrumbs = ({ risks = [], currentTab }: SmartBreadcrumbsProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const getTabInfo = (tab: string) => {
    const tabData = {
      dashboard: { 
        name: 'Dashboard', 
        icon: TrendingUp, 
        suggestion: `${risks.filter(r => r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto').length} riscos críticos` 
      },
      matrix: { 
        name: 'Matriz de Riscos', 
        icon: AlertTriangle, 
        suggestion: risks.length > 0 ? 'Revisar e atualizar' : 'Adicionar primeiro risco' 
      },
      reports: { 
        name: 'Relatórios', 
        icon: FileBarChart, 
        suggestion: 'Gerar relatório mensal' 
      },
      form: { 
        name: 'Gerenciar Riscos', 
        icon: Shield, 
        suggestion: 'Criar novo risco' 
      },
      'master-data': { 
        name: 'Dados Mestres', 
        icon: Database, 
        suggestion: 'Configurar perfis e projetos' 
      },
      users: { 
        name: 'Usuários', 
        icon: Users, 
        suggestion: 'Gerenciar acessos' 
      }
    };
    return tabData[tab as keyof typeof tabData] || { name: tab, icon: Shield, suggestion: '' };
  };

  const tabInfo = currentTab ? getTabInfo(currentTab) : null;

  // Para páginas específicas
  if (location.pathname.includes('/usuarios')) {
    return (
      <div className="mb-4 p-3 bg-card rounded-lg border">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/?tab=dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gerenciamento de Usuários</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            💡 Próximo: Adicionar novos usuários ou editar permissões
          </Badge>
        </div>
      </div>
    );
  }

  if (location.pathname.includes('/risco/')) {
    return (
      <div className="mb-4 p-3 bg-card rounded-lg border">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/?tab=dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/?tab=matrix">Matriz de Riscos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Detalhes do Risco</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            💡 Próximo: Revisar ações de mitigação ou atualizar status
          </Badge>
        </div>
      </div>
    );
  }

  // Para a página principal com tabs
  if (tabInfo) {
    const Icon = tabInfo.icon;
    
    // Check for applied filters in matrix tab
    const appliedFilters = [];
    if (currentTab === 'matrix') {
      const level = searchParams.get('level');
      const status = searchParams.get('status');
      const category = searchParams.get('category');
      const search = searchParams.get('search');

      if (level === 'Crítico,Alto' || level === 'critical-high') appliedFilters.push('Críticos/Altos');
      else if (level && level !== 'all') appliedFilters.push(`Nível: ${level}`);
      if (status && status !== 'all') appliedFilters.push(`Status: ${status}`);
      if (category && category !== 'all') appliedFilters.push(`Categoria: ${category}`);
      if (search) appliedFilters.push(`Busca: ${search}`);
    }
    
    return (
      <div className="mb-4 p-3 bg-card rounded-lg border">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/?tab=dashboard">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentTab !== 'dashboard' && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center">
                    <Icon className="w-4 h-4 mr-1" />
                    {tabInfo.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {appliedFilters.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              🔍 {appliedFilters.length} filtro{appliedFilters.length > 1 ? 's' : ''} ativo{appliedFilters.length > 1 ? 's' : ''}
            </Badge>
          )}
          {!appliedFilters.length && tabInfo.suggestion && (
            <Badge variant="secondary" className="text-xs">
              💡 {tabInfo.suggestion}
            </Badge>
          )}
          {currentTab === 'matrix' && risks.length === 0 && (
            <Badge variant="outline" className="text-xs">
              <Plus className="w-3 h-3 mr-1" />
              <Link to="/?tab=form">Criar primeiro risco</Link>
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return null;
};