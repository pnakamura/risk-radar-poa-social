
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, User, Building2, Calendar, ChevronDown, ChevronUp, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskCardProps {
  risk: Risk;
  expandedRisk: string | null;
  onToggleExpand: (riskId: string) => void;
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
  getRiskLevelColor: (level: string) => string;
  getStatusColor: (status: string) => string;
}

export const RiskCard = ({
  risk,
  expandedRisk,
  onToggleExpand,
  onEdit,
  onDelete,
  getRiskLevelColor,
  getStatusColor
}: RiskCardProps) => {
  return (
    <Card 
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
            onClick={() => onToggleExpand(risk.id)}
            className="w-full text-xs"
          >
            {expandedRisk === risk.id ? 'Menos detalhes' : 'Mais detalhes'}
            {expandedRisk === risk.id ? 
              <ChevronUp className="w-3 h-3 ml-1" /> : 
              <ChevronDown className="w-3 h-3 ml-1" />
            }
          </Button>

          {/* Ações para mobile */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(risk)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDelete(risk)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
              {risk.causas && (
                <div>
                  <span className="font-medium">Causas:</span>
                  <br />
                  <span className="text-gray-600">{risk.causas}</span>
                </div>
              )}
              {risk.consequencias && (
                <div>
                  <span className="font-medium">Consequências:</span>
                  <br />
                  <span className="text-gray-600">{risk.consequencias}</span>
                </div>
              )}
              {risk.acoes_mitigacao && (
                <div>
                  <span className="font-medium">Ações de Mitigação:</span>
                  <br />
                  <span className="text-gray-600">{risk.acoes_mitigacao}</span>
                </div>
              )}
              {risk.acoes_contingencia && (
                <div>
                  <span className="font-medium">Ações de Contingência:</span>
                  <br />
                  <span className="text-gray-600">{risk.acoes_contingencia}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
