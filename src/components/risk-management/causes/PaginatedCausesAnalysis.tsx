import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Target,
  Eye,
  Edit,
  Merge
} from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';
import { ScoreExplanationTooltip } from '../analysis/ScoreExplanationTooltip';
import { useDebounce } from '@/hooks/use-debounce';
import { Progress } from '@/components/ui/progress';

interface PaginatedCausesAnalysisProps {
  onEditCause?: (cause: any) => void;
  onMergeCauses?: (causes: any[]) => void;
}

type SortField = 'score_final' | 'frequencia' | 'impacto_score' | 'criticidade_score' | 'causa_descricao';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;
const CATEGORIES = [
  'Tecnologia',
  'Recursos Humanos', 
  'Financeiro',
  'Operacional',
  'Compliance',
  'Estratégico',
  'Regulatório'
];

export const PaginatedCausesAnalysis: React.FC<PaginatedCausesAnalysisProps> = ({
  onEditCause,
  onMergeCauses
}) => {
  const { commonCauses, loading } = useCausesData();
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<SortField>('score_final');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCauses, setSelectedCauses] = useState<Set<string>>(new Set());

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filtered and sorted data
  const processedCauses = useMemo(() => {
    if (!commonCauses) return [];

    let filtered = commonCauses.filter(cause => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        if (!cause.causa_descricao.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory) {
        if (!cause.categorias.includes(selectedCategory)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'causa_descricao') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [commonCauses, debouncedSearch, selectedCategory, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedCauses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCauses = processedCauses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, sortField, sortDirection]);

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  const toggleCauseSelection = useCallback((causeDescription: string) => {
    setSelectedCauses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(causeDescription)) {
        newSet.delete(causeDescription);
      } else {
        newSet.add(causeDescription);
      }
      return newSet;
    });
  }, []);

  const handleBulkMerge = useCallback(() => {
    if (selectedCauses.size < 2) return;
    
    const causesToMerge = processedCauses.filter(cause => 
      selectedCauses.has(cause.causa_descricao)
    );
    
    onMergeCauses?.(causesToMerge);
    setSelectedCauses(new Set());
  }, [selectedCauses, processedCauses, onMergeCauses]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!commonCauses || commonCauses.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma causa encontrada
          </h3>
          <p className="text-muted-foreground">
            Ainda não há causas registradas nos riscos para análise. Adicione causas aos seus riscos para visualizar esta análise.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Causas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commonCauses.length}</div>
            <p className="text-xs text-muted-foreground">
              {processedCauses.length} após filtros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedCauses[0]?.score_final.toFixed(1) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">score final</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Frequente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...processedCauses.map(c => c.frequencia), 0)}
            </div>
            <p className="text-xs text-muted-foreground">ocorrências</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias Ativas</CardTitle>
            <Filter className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(processedCauses.flatMap(c => c.categorias)).size}
            </div>
            <p className="text-xs text-muted-foreground">categorias distintas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Análise de Causas</CardTitle>
              <CardDescription>
                {processedCauses.length} causas encontradas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar causas..."
                className="pl-10"
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score_final">Score Final</SelectItem>
                    <SelectItem value="frequencia">Frequência</SelectItem>
                    <SelectItem value="impacto_score">Score de Impacto</SelectItem>
                    <SelectItem value="criticidade_score">Criticidade</SelectItem>
                    <SelectItem value="causa_descricao">Nome (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setSortField('score_final');
                      setSortDirection('desc');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                  {selectedCauses.size > 1 && onMergeCauses && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkMerge}
                    >
                      <Merge className="w-4 h-4 mr-1" />
                      Mesclar ({selectedCauses.size})
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Causes List */}
      <div className="space-y-3">
        {paginatedCauses.map((cause, index) => (
          <Card key={`${cause.causa_descricao}-${startIndex + index}`} className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {onMergeCauses && (
                      <input
                        type="checkbox"
                        checked={selectedCauses.has(cause.causa_descricao)}
                        onChange={() => toggleCauseSelection(cause.causa_descricao)}
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-sm font-medium flex-1">
                      {cause.causa_descricao}
                    </span>
                    <Badge variant="secondary">
                      {cause.frequencia} ocorrência{cause.frequencia !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {cause.categorias.map((categoria, catIndex) => (
                      <Badge key={catIndex} variant="outline" className="text-xs">
                        {categoria}
                      </Badge>
                    ))}
                  </div>
                  
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                     <div>
                       <span className="font-medium">Alto:</span> {cause.riscos_alto_impacto}
                     </div>
                     <div>
                       <span className="font-medium">Médio:</span> {cause.riscos_medio_impacto}
                     </div>
                     <div>
                       <span className="font-medium">Baixo:</span> {cause.riscos_baixo_impacto}
                     </div>
                     <div>
                       <span className="font-medium">Confiabilidade:</span> {Math.round(cause.confiabilidade_score * 100)}%
                     </div>
                   </div>

                   {/* Mostrar riscos afetados se disponível */}
                   {cause.riscos_afetados && cause.riscos_afetados.length > 0 && (
                     <div className="mt-3 pt-3 border-t">
                       <div className="text-xs text-muted-foreground mb-1">
                         <span className="font-medium">Riscos Afetados:</span>
                       </div>
                       <div className="flex flex-wrap gap-1">
                         {cause.riscos_afetados.slice(0, 5).map((risco, riscoIndex) => (
                           <Badge key={riscoIndex} variant="outline" className="text-xs bg-primary/5">
                             {risco}
                           </Badge>
                         ))}
                         {cause.riscos_afetados.length > 5 && (
                           <Badge variant="outline" className="text-xs">
                             +{cause.riscos_afetados.length - 5} mais
                           </Badge>
                         )}
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div className="text-right min-w-24 ml-4">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-lg font-bold">
                      {cause.score_final.toFixed(1)}
                    </span>
                    <ScoreExplanationTooltip cause={cause}>
                      <Button variant="ghost" size="sm" className="w-4 h-4 p-0">
                        <AlertTriangle className="w-3 h-3" />
                      </Button>
                    </ScoreExplanationTooltip>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">score final</div>
                  <Progress 
                    value={Math.min((cause.score_final / 10) * 100, 100)} 
                    className="w-20 h-2"
                  />
                  
                  <div className="flex gap-1 mt-2">
                    {onEditCause && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditCause(cause)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {/* View details */}}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, processedCauses.length)} de {processedCauses.length} causas
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};