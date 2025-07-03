
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Filter, Search } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filtrar riscos
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.descricaoRisco.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || risk.categoria === categoryFilter;
    const matchesLevel = !levelFilter || risk.nivelRisco === levelFilter;
    const matchesProject = !projectFilter || risk.projeto === projectFilter;
    
    return matchesSearch && matchesCategory && matchesLevel && matchesProject;
  });

  // Obter valores únicos para filtros
  const categories = [...new Set(risks.map(r => r.categoria))];
  const projects = [...new Set(risks.map(r => r.projeto))];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-red-100 text-red-800';
      case 'Em Monitoramento': return 'bg-yellow-100 text-yellow-800';
      case 'Mitigado': return 'bg-green-100 text-green-800';
      case 'Planejado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar riscos..."
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
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nível de Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os níveis</SelectItem>
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
                <SelectItem value="">Todos os projetos</SelectItem>
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
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Riscos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Matriz de Riscos ({filteredRisks.length} {filteredRisks.length === 1 ? 'risco' : 'riscos'})
          </h3>
        </div>

        {filteredRisks.map((risk) => (
          <Card key={risk.id} className={`transition-all hover:shadow-lg ${
            risk.nivelRisco === 'Alto' ? 'border-l-4 border-red-500 bg-red-50/30' :
            risk.nivelRisco === 'Médio' ? 'border-l-4 border-yellow-500 bg-yellow-50/30' :
            'border-l-4 border-green-500 bg-green-50/30'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    risk.nivelRisco === 'Alto' ? 'text-red-500' :
                    risk.nivelRisco === 'Médio' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-lg">{risk.codigo}</h4>
                    <p className="text-sm text-gray-600">{risk.categoria}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getRiskLevelColor(risk.nivelRisco)}>
                    {risk.nivelRisco}
                  </Badge>
                  <Badge className={getStatusColor(risk.status)}>
                    {risk.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Descrição do Risco</h5>
                  <p className="text-gray-700">{risk.descricaoRisco}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Probabilidade</h6>
                    <p className="text-sm text-gray-600">{risk.probabilidade}</p>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Impacto</h6>
                    <p className="text-sm text-gray-600">{risk.impacto}</p>
                  </div>
                </div>

                <div>
                  <h6 className="font-medium text-gray-900 mb-1">Estratégia</h6>
                  <p className="text-sm text-gray-600">{risk.estrategia}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Responsável</h6>
                    <p className="text-sm text-gray-600">{risk.responsavel}</p>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Projeto</h6>
                    <p className="text-sm text-gray-600">{risk.projeto}</p>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-900 mb-1">Prazo</h6>
                    <p className="text-sm text-gray-600">
                      {new Date(risk.prazo).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRisks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum risco encontrado</h3>
              <p className="text-gray-600">
                Tente ajustar os filtros para encontrar os riscos que você está procurando.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiskMatrix;
