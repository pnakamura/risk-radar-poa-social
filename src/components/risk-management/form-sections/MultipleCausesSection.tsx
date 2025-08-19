import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Lightbulb } from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';
import { FieldHelpButton } from '../help/FieldHelpButton';
import { helpContent } from '../help/helpContent';

interface Cause {
  id?: string;
  descricao: string;
  categoria: string | null;
}

interface MultipleCausesSectionProps {
  riskId?: string;
  causes: Cause[];
  onChange: (causes: Cause[]) => void;
}

const CAUSA_CATEGORIES = [
  'Recursos Humanos',
  'Recursos Financeiros', 
  'Processos',
  'Tecnologia',
  'Comunicação',
  'Fornecedores',
  'Regulamentação',
  'Mercado',
  'Outros'
];

export const MultipleCausesSection: React.FC<MultipleCausesSectionProps> = ({
  riskId,
  causes,
  onChange
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { commonCauses } = useCausesData();

  useEffect(() => {
    // Generate suggestions based on common causes
    const topSuggestions = commonCauses
      .slice(0, 5)
      .map(cause => cause.causa_descricao);
    setSuggestions(topSuggestions);
  }, [commonCauses]);

  const addCause = () => {
    const newCause: Cause = {
      descricao: '',
      categoria: null
    };
    onChange([...causes, newCause]);
  };

  const updateCause = (index: number, field: keyof Cause, value: string) => {
    const updatedCauses = causes.map((cause, i) => 
      i === index ? { ...cause, [field]: value } : cause
    );
    onChange(updatedCauses);
  };

  const removeCause = (index: number) => {
    const updatedCauses = causes.filter((_, i) => i !== index);
    onChange(updatedCauses);
  };

  const applySuggestion = (suggestion: string) => {
    const emptyCauseIndex = causes.findIndex(cause => !cause.descricao);
    if (emptyCauseIndex >= 0) {
      updateCause(emptyCauseIndex, 'descricao', suggestion);
    } else {
      const newCause: Cause = {
        descricao: suggestion,
        categoria: null
      };
      onChange([...causes, newCause]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Causas do Risco</h3>
        <FieldHelpButton field="causas" content={helpContent.causas} />
      </div>

      {suggestions.length > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Causas Comuns Identificadas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applySuggestion(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {causes.map((cause, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor={`causa-${index}`}>Descrição da Causa</Label>
              <Input
                id={`causa-${index}`}
                value={cause.descricao}
                onChange={(e) => updateCause(index, 'descricao', e.target.value)}
                placeholder="Descreva a causa do risco..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`categoria-${index}`}>Categoria</Label>
              <div className="flex gap-2">
                <Select
                  value={cause.categoria || ""}
                  onValueChange={(value) => updateCause(index, 'categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAUSA_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeCause(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addCause}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Causa
      </Button>
    </div>
  );
};