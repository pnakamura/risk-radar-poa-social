
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RiskFormData } from '@/hooks/useRiskForm';
import { FieldHelpButton } from '@/components/risk-management/help/FieldHelpButton';
import { helpContent } from '@/components/risk-management/help/helpContent';

interface ResponseStrategySectionProps {
  formData: RiskFormData;
  onChange: (field: string, value: string) => void;
}

export const ResponseStrategySection = ({ formData, onChange }: ResponseStrategySectionProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Estratégias de Resposta</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="estrategia">Estratégia *</Label>
            <FieldHelpButton field="estrategia" content={helpContent.estrategia} />
          </div>
          <Select value={formData.estrategia} onValueChange={(value) => onChange('estrategia', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a estratégia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mitigar">Mitigar</SelectItem>
              <SelectItem value="Aceitar">Aceitar</SelectItem>
              <SelectItem value="Transferir">Transferir</SelectItem>
              <SelectItem value="Evitar">Evitar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="acoes_mitigacao">Ações de Mitigação</Label>
            <FieldHelpButton field="acoes_mitigacao" content={helpContent.acoes_mitigacao} />
          </div>
          <Textarea
            id="acoes_mitigacao"
            value={formData.acoes_mitigacao}
            onChange={(e) => onChange('acoes_mitigacao', e.target.value)}
            placeholder="Descreva as ações preventivas para reduzir a probabilidade ou impacto..."
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="acoes_contingencia">Ações de Contingência</Label>
            <FieldHelpButton field="acoes_contingencia" content={helpContent.acoes_contingencia} />
          </div>
          <Textarea
            id="acoes_contingencia"
            value={formData.acoes_contingencia}
            onChange={(e) => onChange('acoes_contingencia', e.target.value)}
            placeholder="Descreva as ações a serem tomadas caso o risco se materialize..."
          />
        </div>
      </div>
    </div>
  );
};
