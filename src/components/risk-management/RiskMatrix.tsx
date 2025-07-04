import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Filter, Search, Eye, Calendar, User, Building2, ChevronDown, ChevronUp, Edit, Archive, Trash2, MoreHorizontal, Download } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RiskEditModal } from './RiskEditModal';
import { ConfirmDialog } from './ConfirmDialog';
import { useRiskActions } from '@/hooks/useRiskActions';
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
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());

  const { archiveRisk, removeRisk, isLoading } = useRiskActions();

  if (loading) {
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
      const matchesLevel = !levelFilter || levelFilter === 'all' || risk.nivel_risco === levelFilter;
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

  const handleSelectRisk = (riskId: string) => {
    const newSelected = new Set(selectedRisks);
    if (newSelected.has(riskId)) {
      newSelected.delete(riskId);
    } else {
      newSelected.add(riskId);
    }
    setSelectedRisks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRisks.size === filteredAndSortedRisks.length) {
      setSelectedRisks(new Set());
    } else {
      setSelectedRisks(new Set(filteredAndSortedRisks.map(r => r.id)));
    }
  };

  const handleBulkArchive = async () => {
    const promises = Array.from(selectedRisks).map(riskId => archiveRisk(riskId, true));
    await Promise.all(promises);
    setSelectedRisks(new Set());
    toast.success(`${selectedRisks.size} riscos arquivados com sucesso!`);
    onRefresh();
  };

  const handleDeleteRisk = async () => {
    if (!deletingRisk) return;
    
    const success = await removeRisk(deletingRisk.id);
    if (success) {
      setDeletingRisk(null);
      onRefresh();
    }
  };

  const exportToCSV = () => {
    if (filteredAndSortedRisks.length === 0) {
      toast.error('Nenhum risco para exportar');
      return;
    }

    const headers = ['Código', 'Categoria', 'Descrição', 'Nível', 'Status', 'Responsável', 'Projeto', 'Data'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedRisks.map(risk => [
        risk.codigo,
        risk.categoria,
        `"${risk.descricao_risco?.replace(/"/g, '""')}"`,
        risk.nivel_risco,
        risk.status,
        risk.responsavel?.nome || '',
        risk.projeto?.nome || '',
        risk.data_identificacao || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `matriz-riscos-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo CSV exportado com sucesso!');
  };

  return (
    <div className="space-y-4">
      {/* Header com contador e controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold">Matriz de Riscos</h3>
          <p className="text-sm text-gray-600">
            {filteredAndSortedRisks.length} de {risks.length} {filteredAndSortedRisks.length === 1 ? 'risco' : 'riscos'}
            {selectedRisks.size > 0 && ` (${selectedRisks.size} selecionados)`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedRisks.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={isLoading}
            >
              <Archive className="w-4 h-4 mr-2" />
              Arquivar Selecionados
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Filtros colapsáveis */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Crítico">Crítico</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setLevelFilter('');
                    setProjectFilter('');
                    setStatusFilter('');
                  }}
                  className="w-full"
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

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
            {/* Tabela para desktop */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedRisks.size === filteredAndSortedRisks.length && filteredAndSortedRisks.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead className="w-20 cursor-pointer" onClick={() => handleSort('code')}>
                      Código {sortBy === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="w-32">Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-24 cursor-pointer" onClick={() => handleSort('level')}>
                      Nível {sortBy === 'level' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="w-28 cursor-pointer" onClick={() => handleSort('status')}>
                      Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="w-32">Responsável</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedRisks.map((risk) => (
                    <React.Fragment key={risk.id}>
                      <TableRow 
                        className={`cursor-pointer hover:bg-gray-50 ${
                          risk.nivel_risco === 'Crítico' || risk.nivel_risco === 'Alto' ? 'border-l-4 border-red-500' :
                          risk.nivel_risco === 'Médio' ? 'border-l-4 border-yellow-500' :
                          'border-l-4 border-green-500'
                        } ${selectedRisks.has(risk.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRisks.has(risk.id)}
                            onChange={() => handleSelectRisk(risk.id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium">{risk.codigo}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{risk.categoria}</span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm" title={risk.descricao_risco}>
                            {truncateText(risk.descricao_risco || '', 60)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getRiskLevelColor(risk.nivel_risco)}`}>
                            {risk.nivel_risco}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(risk.status)}`}>
                            {risk.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {risk.responsavel?.nome || 'Não atribuído'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setExpandedRisk(risk.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingRisk(risk)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => archiveRisk(risk.id, true)}>
                                <Archive className="w-4 h-4 mr-2" />
                                Arquivar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingRisk(risk)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                      {/* Linha expandida com detalhes */}
                      {expandedRisk === risk.id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50">
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Probabilidade:</span> {risk.probabilidade}
                                </div>
                                <div>
                                  <span className="font-medium">Impacto:</span> {risk.impacto}
                                </div>
                                <div>
                                  <span className="font-medium">Estratégia:</span> {risk.estrategia}
                                </div>
                                <div>
                                  <span className="font-medium">Projeto:</span> {risk.projeto?.nome || 'Não atribuído'}
                                </div>
                              </div>
                              {risk.prazo && (
                                <div className="text-sm">
                                  <span className="font-medium">Prazo:</span> {new Date(risk.prazo).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                              {risk.acoes_mitigacao && (
                                <div className="text-sm">
                                  <span className="font-medium">Ações de Mitigação:</span> {risk.acoes_mitigacao}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cards para mobile/tablet */}
            <div className="lg:hidden space-y-3 p-4">
              {filteredAndSortedRisks.map((risk) => (
                <Card 
                  key={risk.id} 
                  className={`transition-all ${
                    risk.nivel_risco === 'Crítico' || risk.nivel_risco === 'Alto' ? 'border-l-4 border-red-500' :
                    risk.nivel_risco === 'Médio' ? 'border-l-4 border-yellow-500' :
                    'border-l-4 border-green-500'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header do card */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{risk.codigo}</span>
                          <Badge className={`text-xs ${getRiskLevelColor(risk.nivel_risco)}`}>
                            {risk.nivel_risco}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </Badge>
                      </div>

                      {/* Categoria */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{risk.categoria}</span>
                      </div>

                      {/* Descrição */}
                      <p className="text-sm font-medium">{risk.descricao_risco}</p>

                      {/* Informações adicionais */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{risk.responsavel?.nome || 'Não atribuído'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{risk.projeto?.nome || 'Não atribuído'}</span>
                        </div>
                        {risk.prazo && (
                          <div className="flex items-center gap-1 col-span-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(risk.prazo).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      {/* Toggle para mais detalhes */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                        className="w-full text-xs"
                      >
                        {expandedRisk === risk.id ? 'Menos detalhes' : 'Mais detalhes'}
                        {expandedRisk === risk.id ? 
                          <ChevronUp className="w-3 h-3 ml-1" /> : 
                          <ChevronDown className="w-3 h-3 ml-1" />
                        }
                      </Button>

                      {/* Detalhes expandidos */}
                      {expandedRisk === risk.id && (
                        <div className="pt-3 border-t space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Probabilidade:</span>
                              <br />
                              <span className="text-gray-600">{risk.probabilidade}</span>
                            </div>
                            <div>
                              <span className="font-medium">Impacto:</span>
                              <br />
                              <span className="text-gray-600">{risk.impacto}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Estratégia:</span>
                            <br />
                            <span className="text-gray-600">{risk.estrategia}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <RiskEditModal
        risk={editingRisk}
        isOpen={!!editingRisk}
        onClose={() => setEditingRisk(null)}
        onSuccess={() => {
          onRefresh();
        }}
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
    </div>
  );
};

export default RiskMatrix;
