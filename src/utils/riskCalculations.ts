
import { Database } from '@/integrations/supabase/types';

export const calculateRiskLevel = (
  probabilidade: Database['public']['Enums']['risk_probability'] | '',
  impacto: Database['public']['Enums']['risk_impact'] | ''
): Database['public']['Enums']['risk_level'] => {
  if (!probabilidade || !impacto) return 'Baixo';
  
  const probScore = probabilidade === 'Muito Alta' ? 5 : probabilidade === 'Alta' ? 4 : probabilidade === 'Média' ? 3 : probabilidade === 'Baixa' ? 2 : 1;
  const impactScore = impacto === 'Muito Alto' ? 5 : impacto === 'Alto' ? 4 : impacto === 'Médio' ? 3 : impacto === 'Baixo' ? 2 : 1;
  const riskScore = probScore * impactScore;
  
  if (riskScore >= 16) return 'Crítico';
  if (riskScore >= 9) return 'Alto';
  if (riskScore >= 4) return 'Médio';
  return 'Baixo';
};

export const getRiskLevelColor = (nivel: Database['public']['Enums']['risk_level']) => {
  switch (nivel) {
    case 'Crítico':
      return 'bg-red-100 text-red-800';
    case 'Alto':
      return 'bg-orange-100 text-orange-800';
    case 'Médio':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};
