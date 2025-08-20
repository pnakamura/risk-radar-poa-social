import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Lightbulb, Save, Loader2 } from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';
import { FieldHelpButton } from '../help/FieldHelpButton';
import { helpContent } from '../help/helpContent';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Cause {
  id?: string;
  risco_id?: string;
  descricao: string;
  categoria: string | null;
}

interface EnhancedMultipleCausesSectionProps {
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

export const EnhancedMultipleCausesSection: React.FC<EnhancedMultipleCausesSectionProps> = ({
  riskId,
  causes,
  onChange
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [deletingCause, setDeletingCause] = useState<{ index: number; cause: Cause } | null>(null);
  const [savingStates, setSavingStates] = useState<Set<number>>(new Set());
  const { commonCauses, createCause, updateCause, deleteCause: deleteCauseFromDB } = useCausesData();
  const { toast } = useToast();

  useEffect(() => {
    // Generate suggestions based on common causes with enhanced scoring
    const topSuggestions = commonCauses
      .filter(cause => cause.score_final >= 3.0) // Only high-scoring causes
      .slice(0, 8)
      .map(cause => cause.causa_descricao);
    setSuggestions(topSuggestions);
  }, [commonCauses]);

  const addCause = () => {
    const newCause: Cause = {
      descricao: '',
      categoria: null,
      ...(riskId && { risco_id: riskId })
    };
    onChange([...causes, newCause]);
  };

  const setSavingState = (index: number, saving: boolean) => {
    setSavingStates(prev => {
      const newSet = new Set(prev);
      if (saving) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      return newSet;
    });
  };

  const updateCauseLocal = async (index: number, field: keyof Cause, value: string) => {
    const cause = causes[index];
    const updatedCause = { ...cause, [field]: value };
    
    // Update local state immediately
    const updatedCauses = causes.map((c, i) => 
      i === index ? updatedCause : c
    );
    onChange(updatedCauses);

    // If riskId exists and cause has id, update in database
    if (riskId && cause.id && value.trim()) {
      try {
        setSavingState(index, true);
        const result = await updateCause(cause.id, { [field]: value });
        if (result.error) {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar a causa",
            variant: "destructive",
          });
          console.error('Error updating cause:', result.error);
        }
      } catch (error) {
        console.error('Error updating cause:', error);
      } finally {
        setSavingState(index, false);
      }
    }
  };

  const saveCause = async (index: number) => {
    const cause = causes[index];
    
    if (!riskId || !cause.descricao.trim()) {
      toast({
        title: "Aviso",
        description: "Preencha a descrição da causa antes de salvar",
        variant: "default",
      });
      return;
    }

    if (cause.id) {
      // Already saved, just update
      return;
    }

    try {
      setSavingState(index, true);
      const result = await createCause({
        risco_id: riskId,
        descricao: cause.descricao,
        categoria: cause.categoria
      });
      
      if (result.error) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar a causa",
          variant: "destructive",
        });
        return;
      }

      // Update local state with the created cause ID
      const updatedCauses = causes.map((c, i) => 
        i === index ? { ...c, id: result.data.id } : c
      );
      onChange(updatedCauses);
      
      toast({
        title: "Sucesso",
        description: "Causa salva com sucesso",
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating cause:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar causa",
        variant: "destructive",
      });
    } finally {
      setSavingState(index, false);
    }
  };

  const removeCause = (index: number) => {
    const cause = causes[index];
    
    // If cause has an ID (exists in database), show confirmation dialog
    if (cause.id) {
      setDeletingCause({ index, cause });
    } else {
      // Remove locally if no ID
      const updatedCauses = causes.filter((_, i) => i !== index);
      onChange(updatedCauses);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCause) return;

    try {
      // Delete from database if ID exists
      if (deletingCause.cause.id) {
        const result = await deleteCauseFromDB(deletingCause.cause.id);
        if (result.error) {
          toast({
            title: "Erro",
            description: "Não foi possível deletar a causa",
            variant: "destructive",
          });
          return;
        }
      }

      // Remove from local state
      const updatedCauses = causes.filter((_, i) => i !== deletingCause.index);
      onChange(updatedCauses);
      
      toast({
        title: "Sucesso",
        description: "Causa removida com sucesso",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting cause:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao deletar causa",
        variant: "destructive",
      });
    } finally {
      setDeletingCause(null);
    }
  };

  const applySuggestion = async (suggestion: string) => {
    const emptyCauseIndex = causes.findIndex(cause => !cause.descricao);
    if (emptyCauseIndex >= 0) {
      await updateCauseLocal(emptyCauseIndex, 'descricao', suggestion);
      if (riskId) {
        await saveCause(emptyCauseIndex);
      }
    } else {
      const newCause: Cause = {
        descricao: suggestion,
        categoria: null,
        ...(riskId && { risco_id: riskId })
      };
      onChange([...causes, newCause]);
      
      // Auto-save if riskId exists
      if (riskId) {
        setTimeout(() => saveCause(causes.length), 100);
      }
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
            <span className="text-sm font-medium">Causas Recomendadas (Score Alto)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applySuggestion(suggestion)}
                className="text-xs hover:bg-primary hover:text-primary-foreground"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {causes.map((cause, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg relative">
            {savingStates.has(index) && (
              <div className="absolute top-2 right-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor={`causa-${index}`}>Descrição da Causa</Label>
              <Input
                id={`causa-${index}`}
                value={cause.descricao}
                onChange={(e) => updateCauseLocal(index, 'descricao', e.target.value)}
                placeholder="Descreva a causa do risco..."
                disabled={savingStates.has(index)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`categoria-${index}`}>Categoria</Label>
              <div className="flex gap-2">
                <Select
                  value={cause.categoria || ""}
                  onValueChange={(value) => updateCauseLocal(index, 'categoria', value)}
                  disabled={savingStates.has(index)}
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
                
                <div className="flex gap-1">
                  {riskId && !cause.id && cause.descricao.trim() && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => saveCause(index)}
                      disabled={savingStates.has(index)}
                      title="Salvar causa"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeCause(index)}
                    className="flex-shrink-0"
                    disabled={savingStates.has(index)}
                    title={cause.id ? "Deletar causa (confirmação necessária)" : "Remover causa"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
        disabled={savingStates.size > 0}
      >
        <Plus className="h-4 w-4 mr-2" />
        {savingStates.size > 0 ? 'Processando...' : 'Adicionar Causa'}
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCause} onOpenChange={() => setDeletingCause(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a causa "{deletingCause?.cause.descricao}"? 
              Esta ação não pode ser desfeita e afetará as análises de causas comuns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};