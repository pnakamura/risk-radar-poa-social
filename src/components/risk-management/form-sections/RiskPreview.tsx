
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { RiskFormData } from '@/hooks/useRiskForm';
import { calculateRiskLevel, getRiskLevelColor } from '@/utils/riskCalculations';

interface RiskPreviewProps {
  formData: RiskFormData;
}

export const RiskPreview = ({ formData }: RiskPreviewProps) => {
  const nivelRisco = calculateRiskLevel(formData.probabilidade, formData.impacto);

  if (!formData.codigo && !formData.descricao_risco) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <AlertTriangle className="w-5 h-5" />
          Preview do Risco
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Código:</strong> {formData.codigo}</p>
          <p><strong>Categoria:</strong> {formData.categoria}</p>
          <p><strong>Descrição:</strong> {formData.descricao_risco}</p>
          <p><strong>Nível de Risco:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${getRiskLevelColor(nivelRisco)}`}>
              {nivelRisco}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
