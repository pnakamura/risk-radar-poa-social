
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RiskFormData } from '@/hooks/useRiskForm';
import { FieldHelpButton } from '@/components/risk-management/help/FieldHelpButton';
import { helpContent } from '@/components/risk-management/help/helpContent';

interface BasicInfoSectionProps {
  formData: RiskFormData;
  onChange: (field: string, value: string) => void;
}

export const BasicInfoSection = ({ formData, onChange }: BasicInfoSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="codigo">Código do Risco *</Label>
            <FieldHelpButton field="codigo" content={helpContent.codigo} />
          </div>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => onChange('codigo', e.target.value)}
            placeholder="Ex: RSK-001"
            required
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <FieldHelpButton field="categoria" content={helpContent.categoria} />
          </div>
          <Select value={formData.categoria} onValueChange={(value) => onChange('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Estratégico">Estratégico</SelectItem>
              <SelectItem value="Regulatório">Regulatório</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="descricao_risco">Descrição do Risco *</Label>
          <FieldHelpButton field="descricao_risco" content={helpContent.descricao_risco} />
        </div>
        <Textarea
          id="descricao_risco"
          value={formData.descricao_risco}
          onChange={(e) => onChange('descricao_risco', e.target.value)}
          placeholder="Descreva detalhadamente o risco identificado..."
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="causas">Causas</Label>
            <FieldHelpButton field="causas" content={helpContent.causas} />
          </div>
          <Textarea
            id="causas"
            value={formData.causas}
            onChange={(e) => onChange('causas', e.target.value)}
            placeholder="Descreva as possíveis causas do risco..."
            rows={2}
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="consequencias">Consequências</Label>
            <FieldHelpButton field="consequencias" content={helpContent.consequencias} />
          </div>
          <Textarea
            id="consequencias"
            value={formData.consequencias}
            onChange={(e) => onChange('consequencias', e.target.value)}
            placeholder="Descreva as possíveis consequências..."
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};
