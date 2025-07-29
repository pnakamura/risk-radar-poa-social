
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskTableRowProps {
  risk: Risk;
  expandedRisk: string | null;
  onToggleExpand: (riskId: string) => void;
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
  getRiskLevelColor: (level: string) => string;
  getStatusColor: (status: string) => string;
  truncateText: (text: string, maxLength?: number) => string;
}

export const RiskTableRow = ({
  risk,
  expandedRisk,
  onToggleExpand,
  onEdit,
  onDelete,
  getRiskLevelColor,
  getStatusColor,
  truncateText
}: RiskTableRowProps) => {
  return (
    <>
      <TableRow 
        className={`cursor-pointer hover:bg-gray-50 ${
          risk.nivel_risco === 'Crítico' || risk.nivel_risco === 'Alto' ? 'border-l-4 border-red-500' :
          risk.nivel_risco === 'Médio' ? 'border-l-4 border-yellow-500' :
          'border-l-4 border-green-500'
        }`}
        onClick={() => onToggleExpand(risk.id)}
      >
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
              <DropdownMenuItem onClick={() => onToggleExpand(risk.id)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(risk)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(risk)}
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
                  <span className="font-medium">Projeto:</span> {risk.projeto?.nome || 'Não atribuído'}
                </div>
              </div>
              {risk.prazo && (
                <div className="text-sm">
                  <span className="font-medium">Prazo:</span> {new Date(risk.prazo).toLocaleDateString('pt-BR')}
                </div>
              )}
              {risk.causas && (
                <div className="text-sm">
                  <span className="font-medium">Causas:</span> {risk.causas}
                </div>
              )}
              {risk.consequencias && (
                <div className="text-sm">
                  <span className="font-medium">Consequências:</span> {risk.consequencias}
                </div>
              )}
              {risk.acoes_mitigacao && (
                <div className="text-sm">
                  <span className="font-medium">Ações de Mitigação:</span> {risk.acoes_mitigacao}
                </div>
              )}
              {risk.acoes_contingencia && (
                <div className="text-sm">
                  <span className="font-medium">Ações de Contingência:</span> {risk.acoes_contingencia}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
