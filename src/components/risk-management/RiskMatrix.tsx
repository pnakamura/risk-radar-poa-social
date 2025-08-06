
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RiskEditModal } from './RiskEditModal';
import { ConfirmDialog } from './ConfirmDialog';
import { ExportModal } from './ExportModal';
import { RiskMatrixHeader } from './matrix/RiskMatrixHeader';
import { RiskFilters } from './matrix/RiskFilters';
import { RiskTable } from './matrix/RiskTable';
import { RiskCards } from './matrix/RiskCards';
import { useRiskActions } from '@/hooks/useRiskActions';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Tipo correto baseado no Supabase
type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskMatrixProps {
  risks: Risk[];
  loading: boolean;
  onRefresh: () => void;
}

const RiskMatrix = ({ risks, loading, onRefresh }: RiskMatrixProps) => {
  console.log('RiskMatrix rendering with risks:', risks.length, 'loading:', loading);

  const [searchParams, setSearchParams] = useSearchParams();

  // State para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'level' | 'status' | 'code'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados para modais e ações
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [deletingRisk, setDeletingRisk] = useState<Risk | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const { removeRisk, isLoading } = useRiskActions();

  // Aplicar filtros da URL quando o componente carregar
  useEffect(() => {
    const levelParam = searchParams.get('level');
    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (levelParam) {
      if (levelParam.includes(',')) {
        // Multiple levels (e.g., "Crítico,Alto")
        setLevelFilter('critical-high'); // Special value for combined critical/high
      } else {
        setLevelFilter(levelParam);
      }
    }
    if (statusParam) setStatusFilter(statusParam);
    if (categoryParam) setCategoryFilter(categoryParam);
    if (searchParam) setSearchTerm(searchParam);

    // Auto-show filters if any are applied
    if (levelParam || statusParam || categoryParam || searchParam) {
      setShowFilters(true);
    }
  }, [searchParams]);

  if (loading) {
    console.log('RiskMatrix showing loading state');
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filtrar e ordenar riscos
  const filteredAndSortedRisks = risks
    .filter(risk => {
      const matchesSearch = risk.descricao_risco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           risk.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || categoryFilter === 'all' || risk.categoria === categoryFilter;
      
      // Handle special case for critical-high filter
      let matchesLevel = true;
      if (levelFilter && levelFilter !== 'all') {
        if (levelFilter === 'critical-high') {
          matchesLevel = risk.nivel_risco === 'Crítico' || risk.nivel_risco === 'Alto';
        } else {
          matchesLevel = risk.nivel_risco === levelFilter;
        }
      }
      
      const matchesProject = !projectFilter || projectFilter === 'all' || risk.projeto?.nome === projectFilter;
      const matchesStatus = !statusFilter || statusFilter === 'all' || risk.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesLevel && matchesProject && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'code':
          aValue = a.codigo;
          bValue = b.codigo;
          break;
        case 'level':
          const levelOrder = { 'Crítico': 4, 'Alto': 3, 'Médio': 2, 'Baixo': 1 };
          aValue = levelOrder[a.nivel_risco as keyof typeof levelOrder] || 0;
          bValue = levelOrder[b.nivel_risco as keyof typeof levelOrder] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
        default:
          aValue = new Date(a.data_identificacao || 0).getTime();
          bValue = new Date(b.data_identificacao || 0).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  console.log('Filtered risks:', filteredAndSortedRisks.length);

  // Obter valores únicos para filtros
  const categories = [...new Set(risks.map(r => r.categoria).filter(Boolean))];
  const projects = [...new Set(risks.map(r => r.projeto?.nome).filter(Boolean))];
  const statuses = [...new Set(risks.map(r => r.status).filter(Boolean))];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Crítico': return 'bg-red-500 text-white';
      case 'Alto': return 'bg-red-400 text-white';
      case 'Médio': return 'bg-yellow-500 text-white';
      case 'Baixo': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Identificado': return 'bg-blue-100 text-blue-800';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
      case 'Em Monitoramento': return 'bg-orange-100 text-orange-800';
      case 'Em Andamento': return 'bg-purple-100 text-purple-800';
      case 'Mitigado': return 'bg-green-100 text-green-800';
      case 'Aceito': return 'bg-gray-100 text-gray-800';
      case 'Transferido': return 'bg-indigo-100 text-indigo-800';
      case 'Eliminado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteRisk = async () => {
    if (!deletingRisk) return;
    
    const success = await removeRisk(deletingRisk.id);
    if (success) {
      setDeletingRisk(null);
      onRefresh();
    }
  };


  const handleExport = () => {
    setShowExportModal(true);
  };

  const getAppliedFilters = () => {
    const filters: Record<string, any> = {};
    if (searchTerm) filters['Termo de busca'] = searchTerm;
    if (categoryFilter) filters['Categoria'] = categoryFilter;
    if (levelFilter) filters['Nível'] = levelFilter;
    if (projectFilter) filters['Projeto'] = projectFilter;
    if (statusFilter) filters['Status'] = statusFilter;
    return filters;
  };

  const handleToggleExpand = (riskId: string) => {
    setExpandedRisk(expandedRisk === riskId ? null : riskId);
  };

  const handleEditRisk = (risk: Risk) => {
    console.log('Opening edit modal for risk:', risk.id, risk.codigo);
    setEditingRisk(risk);
  };

  const handleCloseEditModal = () => {
    console.log('Closing edit modal');
    setEditingRisk(null);
  };

  const handleEditSuccess = () => {
    console.log('Edit successful, refreshing data');
    onRefresh();
    setEditingRisk(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLevelFilter('');
    setProjectFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-4">
      <RiskMatrixHeader
        filteredRisksCount={filteredAndSortedRisks.length}
        totalRisksCount={risks.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onExportCSV={handleExport}
      />

      <RiskFilters
        showFilters={showFilters}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        levelFilter={levelFilter}
        projectFilter={projectFilter}
        statusFilter={statusFilter}
        categories={categories}
        projects={projects}
        statuses={statuses}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onLevelChange={setLevelFilter}
        onProjectChange={setProjectFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      {/* Tabela de Riscos */}
      {filteredAndSortedRisks.length === 0 && !loading ? (
        <EmptyState
          icon="risk"
          title={risks.length === 0 ? 'Nenhum risco cadastrado' : 'Nenhum risco encontrado'}
          description={
            risks.length === 0 
              ? 'Cadastre seu primeiro risco na aba "Gerenciar Riscos".'
              : 'Tente ajustar os filtros para encontrar os riscos que você está procurando.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <RiskTable
              risks={filteredAndSortedRisks}
              expandedRisk={expandedRisk}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onToggleExpand={handleToggleExpand}
              onEdit={handleEditRisk}
              onDelete={setDeletingRisk}
              onSort={handleSort}
              getRiskLevelColor={getRiskLevelColor}
              getStatusColor={getStatusColor}
              truncateText={truncateText}
            />

            <RiskCards
              risks={filteredAndSortedRisks}
              expandedRisk={expandedRisk}
              onToggleExpand={handleToggleExpand}
              onEdit={handleEditRisk}
              onDelete={setDeletingRisk}
              getRiskLevelColor={getRiskLevelColor}
              getStatusColor={getStatusColor}
            />
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <RiskEditModal
        risk={editingRisk}
        isOpen={!!editingRisk}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        isOpen={!!deletingRisk}
        onClose={() => setDeletingRisk(null)}
        onConfirm={handleDeleteRisk}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o risco "${deletingRisk?.codigo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="destructive"
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        risks={filteredAndSortedRisks}
        appliedFilters={getAppliedFilters()}
      />
    </div>
  );
};

export default RiskMatrix;
