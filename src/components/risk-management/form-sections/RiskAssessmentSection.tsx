
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RiskFormData } from '@/hooks/useRiskForm';
import { calculateRiskLevel, getRiskLevelColor } from '@/utils/riskCalculations';

interface RiskAssessmentSectionProps {
  formData: RiskFormData;
  onChange: (field: string, value: string) => void;
}

export const RiskAssessmentSection = ({ formData, onChange }: RiskAssessmentSectionProps) => {
  const nivelRisco = calculateRiskLevel(formData.probabilidade, formData.impacto);

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Avaliação de Risco</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="probabilidade">Probabilidade *</Label>
          <Select value={formData.probabilidade} onValueChange={(value) => onChange('probabilidade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Muito Baixa">Muito Baixa</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Muito Alta">Muito Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="impacto">Impacto *</Label>
          <Select value={formData.impacto} onValueChange={(value) => onChange('impacto', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Muito Baixo">Muito Baixo</SelectItem>
              <SelectItem value="Baixo">Baixo</SelectItem>
              <SelectItem value="Médio">Médio</SelectItem>
              <SelectItem value="Alto">Alto</SelectItem>
              <SelectItem value="Muito Alto">Muito Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Nível de Risco (Calculado)</Label>
          <div className={`p-3 rounded-md text-center font-semibold ${getRiskLevelColor(nivelRisco)}`}>
            {nivelRisco}
          </div>
        </div>
      </div>
    </div>
  );
};
