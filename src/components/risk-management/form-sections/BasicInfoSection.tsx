
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RiskFormData } from '@/hooks/useRiskForm';
import { FieldHelpButton } from '@/components/risk-management/help/FieldHelpButton';
import { helpContent } from '@/components/risk-management/help/helpContent';
import { RefreshCw } from 'lucide-react';
import { IntelligentCauseEditor } from '../causes/IntelligentCauseEditor';
import { AIPopulatedBadge } from '@/components/ui/ai-populated-badge';

interface Cause {
  id?: string;
  descricao: string;
  categoria: string | null;
}

interface BasicInfoSectionProps {
  formData: RiskFormData & { causas_estruturadas?: Cause[] };
  onChange: (field: string, value: string | Cause[]) => void;
  onGenerateCode?: () => void;
  projects?: Array<{ id: string; nome: string; }>;
  isAIPopulated?: boolean;
  isEditMode?: boolean;
}

export const BasicInfoSection = ({ formData, onChange, onGenerateCode, projects, isAIPopulated = false, isEditMode = false }: BasicInfoSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEditMode ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="codigo">Código do Risco *</Label>
              <FieldHelpButton field="codigo" content={helpContent.codigo} />
              <AIPopulatedBadge show={isAIPopulated && !!formData.codigo} />
            </div>
             <div className="flex gap-2">
               <Input
                 id="codigo"
                 value={formData.codigo}
                 onChange={(e) => onChange('codigo', e.target.value)}
                 placeholder="Ex: BID-R-001"
                 required
                 className="flex-1"
               />
              {onGenerateCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onGenerateCode}
                  disabled={!formData.projeto_id}
                  className="px-3"
                  title="Gerar código automaticamente"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label>Código do Risco</Label>
              <FieldHelpButton field="codigo" content={helpContent.codigo} />
            </div>
            <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border border-dashed">
              O código será gerado automaticamente ao salvar o risco
            </div>
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="categoria">Categoria *</Label>
            <FieldHelpButton field="categoria" content={helpContent.categoria} />
            <AIPopulatedBadge show={isAIPopulated && !!formData.categoria} />
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
          <Label htmlFor="descricao_risco">Nome do Risco *</Label>
          <FieldHelpButton field="descricao_risco" content={helpContent.descricao_risco} />
          <AIPopulatedBadge show={isAIPopulated && !!formData.descricao_risco} />
        </div>
        <Textarea
          id="descricao_risco"
          value={formData.descricao_risco}
          onChange={(e) => onChange('descricao_risco', e.target.value)}
          placeholder="Digite um nome claro e objetivo para o risco (ex: Interrupção do sistema ERP principal)"
          rows={3}
          required
          maxLength={150}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 Use um nome conciso que identifique claramente o risco. Máximo 150 caracteres.
        </p>
      </div>
      
      <div className="mt-4">
        <IntelligentCauseEditor 
          causes={formData.causas_estruturadas || []}
          onChange={(causes) => onChange('causas_estruturadas', causes)}
        />
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="consequencias">Consequências</Label>
          <FieldHelpButton field="consequencias" content={helpContent.consequencias} />
          <AIPopulatedBadge show={isAIPopulated && !!formData.consequencias} />
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
  );
};
