import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface GlobalSearchProps {
  risks: Risk[];
  onResultClick?: (result: any) => void;
  placeholder?: string;
}

export const GlobalSearch = ({ risks, onResultClick, placeholder = "Buscar riscos..." }: GlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Gerar sugestões inteligentes
  useEffect(() => {
    const smartSuggestions = [
      'riscos críticos',
      'riscos vencidos',
      'sem responsável',
      'projeto específico',
      'mitigados esta semana',
      'alto impacto',
      'categoria operacional'
    ];
    setSuggestions(smartSuggestions);
  }, []);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    
    return risks.filter(risk => {
      // Busca inteligente por múltiplos campos
      const searchableText = [
        risk.codigo,
        risk.categoria,
        risk.descricao_risco,
        risk.causas,
        risk.consequencias,
        risk.nivel_risco,
        risk.status,
        risk.responsavel?.nome,
        risk.projeto?.nome,
        risk.estrategia
      ].filter(Boolean).join(' ').toLowerCase();

      // Busca por contexto
      const contextualSearches = [
        { pattern: 'críticos', condition: () => risk.nivel_risco === 'Crítico' },
        { pattern: 'altos', condition: () => risk.nivel_risco === 'Alto' },
        { pattern: 'vencidos', condition: () => risk.prazo && new Date(risk.prazo) < new Date() },
        { pattern: 'sem responsável', condition: () => !risk.responsavel_id },
        { pattern: 'mitigados', condition: () => risk.status === 'Mitigado' },
        { pattern: 'pendentes', condition: () => risk.status === 'Em Análise' || risk.status === 'Em Monitoramento' }
      ];

      // Verificar busca contextual
      for (const search of contextualSearches) {
        if (term.includes(search.pattern) && search.condition()) {
          return true;
        }
      }

      return searchableText.includes(term);
    }).slice(0, 8); // Limitar resultados
  }, [searchTerm, risks]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsOpen(true);
    
    // Salvar busca recente
    if (term.trim()) {
      const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    }
  };

  const handleResultClick = (risk: Risk) => {
    setIsOpen(false);
    onResultClick?.(risk);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0">
              <Filter className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filtros Rápidos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSearch('riscos críticos')}>
              Riscos Críticos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSearch('sem responsável')}>
              Sem Responsável
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSearch('vencidos')}>
              Vencidos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSearch('mitigados')}>
              Mitigados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Resultados da busca */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-2">
            {searchTerm.trim() ? (
              <>
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      {searchResults.length} resultado(s) encontrado(s)
                    </div>
                    {searchResults.map((risk) => (
                      <button
                        key={risk.id}
                        onClick={() => handleResultClick(risk)}
                        className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{risk.codigo}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {risk.descricao_risco}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              risk.nivel_risco === 'Crítico' ? 'border-red-500 text-red-700' :
                              risk.nivel_risco === 'Alto' ? 'border-orange-500 text-orange-700' :
                              risk.nivel_risco === 'Médio' ? 'border-yellow-500 text-yellow-700' :
                              'border-green-500 text-green-700'
                            }`}
                          >
                            {risk.nivel_risco}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nenhum resultado encontrado
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {/* Buscas recentes */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1">
                      <Clock className="w-3 h-3" />
                      Buscas recentes
                    </div>
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sugestões inteligentes */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1">
                    <Bookmark className="w-3 h-3" />
                    Sugestões
                  </div>
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-muted-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overlay para fechar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};