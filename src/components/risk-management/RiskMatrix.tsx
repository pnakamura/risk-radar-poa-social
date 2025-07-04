
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Filter, Search, Eye, Calendar, User, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Risk {
  id: string;
  codigo: string;
  categoria: string;
  descricaoRisco: string;
  probabilidade: string;
  impacto: string;
  nivelRisco: string;
  estrategia: string;
  responsavel: string;
  status: string;
  projeto: string;
  prazo: string;
}

interface RiskMatrixProps {
  risks: Risk[];
  loading: boolean;
}

const RiskMatrix = ({ risks, loading }: RiskMatrixProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // Filtrar riscos
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.descricaoRisco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || risk.categoria === categoryFilter;
    const matchesLevel = !levelFilter || levelFilter === 'all' || risk.nivelRisco === levelFilter;
    const matchesProject = !projectFilter || projectFilter === 'all' || risk.projeto === projectFilter;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesProject;
  });

  // Obter valores únicos para filtros
  const categories = [...new Set(risks.map(r => r.categoria).filter(Boolean))];
  const projects = [...new Set(risks.map(r => r.projeto).filter(Boolean))];

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

  return (
    <div className="space-y-4">
      {/* Header com contador e toggle de filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold">Matriz de Riscos</h3>
          <p className="text-sm text-gray-600">
            {filteredRisks.length} de {risks.length} {filteredRisks.length === 1 ? 'risco' : 'riscos'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Filtros colapsáveis */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
      {filteredRisks.length === 0 && !loading ? (
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
                    <TableHead className="w-20">Código</TableHead>
                    <TableHead className="w-32">Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-24">Nível</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-32">Responsável</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.map((risk) => (
                    <React.Fragment key={risk.id}>
                      <TableRow 
                        className={`cursor-pointer hover:bg-gray-50 ${
                          risk.nivelRisco === 'Crítico' || risk.nivelRisco === 'Alto' ? 'border-l-4 border-red-500' :
                          risk.nivelRisco === 'Médio' ? 'border-l-4 border-yellow-500' :
                          'border-l-4 border-green-500'
                        }`}
                        onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      >
                        <TableCell className="font-mono text-sm font-medium">{risk.codigo}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{risk.categoria}</span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm" title={risk.descricaoRisco}>
                            {truncateText(risk.descricaoRisco, 60)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getRiskLevelColor(risk.nivelRisco)}`}>
                            {risk.nivelRisco}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(risk.status)}`}>
                            {risk.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {risk.responsavel || 'Não atribuído'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {/* Linha expandida com detalhes */}
                      {expandedRisk === risk.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-gray-50">
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
                                  <span className="font-medium">Projeto:</span> {risk.projeto || 'Não atribuído'}
                                </div>
                              </div>
                              {risk.prazo && (
                                <div className="text-sm">
                                  <span className="font-medium">Prazo:</span> {new Date(risk.prazo).toLocaleDateString('pt-BR')}
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
              {filteredRisks.map((risk) => (
                <Card 
                  key={risk.id} 
                  className={`transition-all ${
                    risk.nivelRisco === 'Crítico' || risk.nivelRisco === 'Alto' ? 'border-l-4 border-red-500' :
                    risk.nivelRisco === 'Médio' ? 'border-l-4 border-yellow-500' :
                    'border-l-4 border-green-500'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header do card */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{risk.codigo}</span>
                          <Badge className={`text-xs ${getRiskLevelColor(risk.nivelRisco)}`}>
                            {risk.nivelRisco}
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
                      <p className="text-sm font-medium">{risk.descricaoRisco}</p>

                      {/* Informações adicionais */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{risk.responsavel || 'Não atribuído'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{risk.projeto || 'Não atribuído'}</span>
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
    </div>
  );
};

export default RiskMatrix;
