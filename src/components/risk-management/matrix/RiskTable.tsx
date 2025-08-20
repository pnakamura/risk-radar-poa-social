
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RiskTableRow } from './RiskTableRow';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskTableProps {
  risks: Risk[];
  expandedRisk: string | null;
  sortBy: 'date' | 'level' | 'status' | 'code';
  sortOrder: 'asc' | 'desc';
  onToggleExpand: (riskId: string) => void;
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
  onSort: (field: 'date' | 'level' | 'status' | 'code') => void;
  getRiskLevelColor: (level: string) => string;
  getStatusColor: (status: string) => string;
  truncateText: (text: string, maxLength?: number) => string;
}

export const RiskTable = ({
  risks,
  expandedRisk,
  sortBy,
  sortOrder,
  onToggleExpand,
  onEdit,
  onDelete,
  onSort,
  getRiskLevelColor,
  getStatusColor,
  truncateText
}: RiskTableProps) => {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 cursor-pointer" onClick={() => onSort('code')}>
              Código {sortBy === 'code' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="w-32">Categoria</TableHead>
            <TableHead>Nome do Risco</TableHead>
            <TableHead className="w-24 cursor-pointer" onClick={() => onSort('level')}>
              Nível {sortBy === 'level' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="w-28 cursor-pointer" onClick={() => onSort('status')}>
              Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="w-32">Responsável</TableHead>
            <TableHead className="w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((risk) => (
            <RiskTableRow
              key={risk.id}
              risk={risk}
              expandedRisk={expandedRisk}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              getRiskLevelColor={getRiskLevelColor}
              getStatusColor={getStatusColor}
              truncateText={truncateText}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
