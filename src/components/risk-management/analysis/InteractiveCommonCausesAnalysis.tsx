import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Target, BarChart3, Search, Filter, Download, Eye, ChevronDown, ChevronUp, HelpCircle, Info } from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreExplanationTooltip } from './ScoreExplanationTooltip';

// Paleta de cores mais amigável e acessível
const FRIENDLY_COLORS = [
  'hsl(210, 70%, 60%)', // Azul suave
  'hsl(150, 60%, 55%)', // Verde suave
  'hsl(280, 60%, 65%)', // Roxo suave
  'hsl(30, 80%, 65%)',  // Laranja suave
  'hsl(340, 60%, 65%)', // Rosa suave
  'hsl(200, 55%, 60%)', // Azul acinzentado
  'hsl(45, 75%, 60%)',  // Amarelo suave
  'hsl(180, 50%, 60%)'  // Turquesa suave
];

interface CauseDetail {
  causa_descricao: string;
  frequencia: number;
  categorias: string[];
  riscos_alto_impacto: number;
  riscos_medio_impacto: number;
  riscos_baixo_impacto: number;
  impacto_score: number;
  criticidade_score: number;
  tendencia_score: number;
  complexidade_score: number;
  score_final: number;
  confiabilidade_score: number;
}

export const InteractiveCommonCausesAnalysis: React.FC = () => {
  const { commonCauses, loading } = useCausesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score_final');
  const [selectedCause, setSelectedCause] = useState<CauseDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const filteredAndSortedCauses = useMemo(() => {
    if (!commonCauses) return [];

    let filtered = commonCauses.filter(cause => {
      const matchesSearch = cause.causa_descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || cause.categorias.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'frequencia':
          return b.frequencia - a.frequencia;
        case 'impacto':
          return b.impacto_score - a.impacto_score;
        case 'score_final':
          return b.score_final - a.score_final;
        case 'criticidade':
          return b.criticidade_score - a.criticidade_score;
        case 'confiabilidade':
          return b.confiabilidade_score - a.confiabilidade_score;
        case 'alfabetico':
          return a.causa_descricao.localeCompare(b.causa_descricao);
        default:
          return b.score_final - a.score_final;
      }
    });

    return filtered;
  }, [commonCauses, searchTerm, selectedCategory, sortBy]);

  const allCategories = useMemo(() => {
    if (!commonCauses) return [];
    const categories = new Set<string>();
    commonCauses.forEach(cause => {
      cause.categorias.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).filter(Boolean);
  }, [commonCauses]);

  const stats = useMemo(() => {
    if (!filteredAndSortedCauses.length) return { 
      total: 0, 
      avgImpact: 0, 
      avgScore: 0,
      avgConfiabilidade: 0,
      totalFreq: 0, 
      categories: 0 
    };
    
    const totalFreq = filteredAndSortedCauses.reduce((sum, cause) => sum + cause.frequencia, 0);
    const avgImpact = filteredAndSortedCauses.reduce((sum, cause) => sum + cause.impacto_score, 0) / filteredAndSortedCauses.length;
    const avgScore = filteredAndSortedCauses.reduce((sum, cause) => sum + cause.score_final, 0) / filteredAndSortedCauses.length;
    const avgConfiabilidade = filteredAndSortedCauses.reduce((sum, cause) => sum + cause.confiabilidade_score, 0) / filteredAndSortedCauses.length;
    const uniqueCategories = new Set();
    filteredAndSortedCauses.forEach(cause => cause.categorias.forEach(cat => uniqueCategories.add(cat)));
    
    return {
      total: filteredAndSortedCauses.length,
      avgImpact,
      avgScore,
      avgConfiabilidade,
      totalFreq,
      categories: uniqueCategories.size
    };
  }, [filteredAndSortedCauses]);

  const categoryData = useMemo(() => {
    if (!filteredAndSortedCauses.length) return [];
    const data = filteredAndSortedCauses.reduce((acc, cause) => {
      cause.categorias.forEach(categoria => {
        if (categoria) {
          acc[categoria] = (acc[categoria] || 0) + cause.frequencia;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredAndSortedCauses]);

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCauseClick = (cause: CauseDetail) => {
    setSelectedCause(cause);
    setIsDetailOpen(true);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Causa,Frequência,Impacto Score,Alto Impacto,Médio Impacto,Baixo Impacto,Categorias\n"
      + filteredAndSortedCauses.map(cause => 
          `"${cause.causa_descricao}",${cause.frequencia},${cause.impacto_score},${cause.riscos_alto_impacto},${cause.riscos_medio_impacto},${cause.riscos_baixo_impacto},"${cause.categorias.join(', ')}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analise_causas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="h-48 bg-muted rounded"></CardContent>
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
          <p className="text-muted-foreground mb-4">
            Ainda não há causas registradas nos riscos para análise. Adicione causas aos seus riscos para visualizar esta análise.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Interactive Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg backdrop-blur-sm"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar causas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {allCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_final">Score Final</SelectItem>
            <SelectItem value="impacto">Impacto</SelectItem>
            <SelectItem value="criticidade">Criticidade</SelectItem>
            <SelectItem value="frequencia">Frequência</SelectItem>
            <SelectItem value="confiabilidade">Confiabilidade</SelectItem>
            <SelectItem value="alfabetico">A-Z</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={exportData} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-300 border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Causas Filtradas</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Número total de causas que correspondem aos filtros aplicados</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">de {commonCauses.length} total</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-300 border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Score Final Médio</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Score final composto médio das causas filtradas.<br/>Combina impacto, criticidade, frequência, tendência e complexidade.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">de 10.0</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-300 border-green-200 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Total Ocorrências</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Soma total de todas as ocorrências das causas filtradas.<br/>Indica o volume geral de problemas identificados.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalFreq}
            </div>
            <p className="text-xs text-muted-foreground">frequência total</p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-300 border-purple-200 bg-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Categorias Ativas</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Número de categorias diferentes representadas<br/>nas causas filtradas.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.categories}
            </div>
            <p className="text-xs text-muted-foreground">diferentes categorias</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Causas Mais Frequentes</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gráfico de barras mostrando as causas que mais se repetem.<br/>Ajuda a identificar padrões recorrentes que precisam de atenção.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                Top {Math.min(10, filteredAndSortedCauses.length)} causas filtradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredAndSortedCauses.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="causa_descricao" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    fontSize={10}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name) => [value, 'Frequência']}
                    labelStyle={{ fontSize: '12px' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="frequencia" 
                    fill="hsl(210, 70%, 60%)"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Distribuição por Categoria</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gráfico de pizza mostrando como as causas se distribuem<br/>por categoria. Útil para entender áreas de concentração.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                Análise das causas filtradas por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FRIENDLY_COLORS[index % FRIENDLY_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Interactive Causes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Ranking Interativo de Causas</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lista interativa ordenada por impacto ou frequência.<br/>Clique nas causas para ver detalhes ou expanda para mais informações.<br/>Use os controles acima para filtrar e ordenar.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <CardDescription>
              Clique nas causas para ver detalhes ou expanda para mais informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {filteredAndSortedCauses.slice(0, 15).map((cause, index) => (
                  <motion.div
                    key={`${cause.causa_descricao}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group border rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-muted/20"
                    onClick={() => handleCauseClick(cause)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                            {cause.causa_descricao}
                          </span>
                          <Badge variant="secondary" className="group-hover:bg-blue-100 bg-blue-50 text-blue-700 border-blue-200">
                            {cause.frequencia} ocorrências
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpansion(index);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {expandedCards.has(index) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="flex gap-2 mb-2">
                          {cause.categorias.map((categoria, catIndex) => (
                            <Badge key={catIndex} variant="outline" className="text-xs border-purple-200 text-purple-700">
                              {categoria}
                            </Badge>
                          ))}
                        </div>
                        
                        <AnimatePresence>
                          {expandedCards.has(index) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t"
                            >
                              <div className="text-center">
                                <div className="font-medium text-red-600">{cause.riscos_alto_impacto}</div>
                                <div>Alto Impacto</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-orange-600">{cause.riscos_medio_impacto}</div>
                                <div>Médio Impacto</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-green-600">{cause.riscos_baixo_impacto}</div>
                                <div>Baixo Impacto</div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="text-right min-w-20 ml-4">
                        <ScoreExplanationTooltip cause={cause}>
                          <div className="text-lg font-bold group-hover:text-blue-600 transition-colors cursor-help">
                            {cause.score_final.toFixed(1)}
                          </div>
                        </ScoreExplanationTooltip>
                        <div className="text-xs text-muted-foreground">score final</div>
                        <Progress 
                          value={(cause.score_final / 10) * 100} 
                          className="w-16 h-2 mt-1"
                        />
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            cause.confiabilidade_score >= 0.8 ? 'bg-green-500' : 
                            cause.confiabilidade_score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-xs text-muted-foreground">
                            {(cause.confiabilidade_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCauseClick(cause);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Causa</DialogTitle>
            <DialogDescription>
              Análise detalhada da causa selecionada
            </DialogDescription>
          </DialogHeader>
          {selectedCause && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">{selectedCause.causa_descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Frequência</h4>
                  <div className="text-2xl font-bold text-primary">{selectedCause.frequencia}</div>
                  <p className="text-xs text-muted-foreground">ocorrências registradas</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Score Final</h4>
                  <ScoreExplanationTooltip cause={selectedCause}>
                    <div className="text-2xl font-bold text-destructive cursor-help">
                      {selectedCause.score_final.toFixed(2)}
                    </div>
                  </ScoreExplanationTooltip>
                  <Progress value={(selectedCause.score_final / 10) * 100} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Confiabilidade: {(selectedCause.confiabilidade_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Score de Impacto</h4>
                  <div className="text-xl font-bold text-orange-600">{selectedCause.impacto_score.toFixed(1)}</div>
                  <Progress value={(selectedCause.impacto_score / 5) * 100} className="mt-1" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Score de Criticidade</h4>
                  <div className="text-xl font-bold text-red-600">{selectedCause.criticidade_score.toFixed(1)}</div>
                  <Progress value={(selectedCause.criticidade_score / 25) * 100} className="mt-1" />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Categorias</h4>
                <div className="flex gap-2">
                  {selectedCause.categorias.map((categoria, index) => (
                    <Badge key={index} variant="outline">{categoria}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Distribuição de Impacto</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{selectedCause.riscos_alto_impacto}</div>
                    <div className="text-xs text-red-700">Alto Impacto</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">{selectedCause.riscos_medio_impacto}</div>
                    <div className="text-xs text-orange-700">Médio Impacto</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{selectedCause.riscos_baixo_impacto}</div>
                    <div className="text-xs text-green-700">Baixo Impacto</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
};