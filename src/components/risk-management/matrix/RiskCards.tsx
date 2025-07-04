
import React from 'react';
import { RiskCard } from './RiskCard';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskCardsProps {
  risks: Risk[];
  expandedRisk: string | null;
  onToggleExpand: (riskId: string) => void;
  onEdit: (risk: Risk) => void;
  onDelete: (risk: Risk) => void;
  getRiskLevelColor: (level: string) => string;
  getStatusColor: (status: string) => string;
}

export const RiskCards = ({
  risks,
  expandedRisk,
  onToggleExpand,
  onEdit,
  onDelete,
  getRiskLevelColor,
  getStatusColor
}: RiskCardsProps) => {
  return (
    <div className="lg:hidden space-y-3 p-4">
      {risks.map((risk) => (
        <RiskCard
          key={risk.id}
          risk={risk}
          expandedRisk={expandedRisk}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          getRiskLevelColor={getRiskLevelColor}
          getStatusColor={getStatusColor}
        />
      ))}
    </div>
  );
};
