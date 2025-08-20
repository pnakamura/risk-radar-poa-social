import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  AlertTriangle, 
  Lightbulb, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Search, 
  History,
  Merge,
  Target
} from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';
import { CauseValidationAlert } from './CauseValidationAlert';
import { CauseInsightDashboard } from './CauseInsightDashboard';
import { useCauseConsistency } from '@/hooks/useCauseConsistency';
import { findSimilarCauses, isDuplicateCause, suggestCategory, SimilarCause } from '@/utils/causesSimilarity';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface Cause {
  id?: string;
  descricao: string;
  categoria: string | null;
  isNew?: boolean;
  isEditing?: boolean;
}

interface IntelligentCauseEditorProps {
  riskId?: string;
  causes: Cause[];
  onChange: (causes: Cause[]) => void;
}

const CATEGORIES = [
  'Tecnologia',
  'Recursos Humanos', 
  'Financeiro',
  'Operacional',
  'Compliance',
  'Estratégico',
  'Regulatório'
];

export const IntelligentCauseEditor: React.FC<IntelligentCauseEditorProps> = ({
  riskId,
  causes,
  onChange
}) => {
  const { commonCauses, createCause, updateCause, deleteCause, loading } = useCausesData();
  const [newCauseText, setNewCauseText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [similarCauses, setSimilarCauses] = useState<SimilarCause[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [savingStates, setSavingStates] = useState<Set<number>>(new Set());
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingCause, setPendingCause] = useState<{ text: string; category: string | null } | null>(null);

  // Debounce the input for similarity search
  const debouncedText = useDebounce(newCauseText, 300);

  // Memoized common causes for performance
  const commonCausesData = useMemo(() => {
    return commonCauses.map(cc => ({
      descricao: cc.causa_descricao,
      categoria: cc.categorias[0] || null,
      frequency: cc.frequencia
    }));
  }, [commonCauses]);

  // Find similar causes when text changes
  useEffect(() => {
    if (debouncedText.length >= 3) {
      const similar = findSimilarCauses(debouncedText, commonCausesData, 0.6);
      setSimilarCauses(similar);
      setShowSuggestions(similar.length > 0);
      
      // Auto-suggest category
      if (!selectedCategory) {
        const suggestedCategory = suggestCategory(debouncedText);
        if (suggestedCategory) {
          setSelectedCategory(suggestedCategory);
        }
      }
    } else {
      setSimilarCauses([]);
      setShowSuggestions(false);
    }
  }, [debouncedText, commonCausesData, selectedCategory]);

  // Add new cause with duplicate detection
  const handleAddCause = useCallback(async () => {
    if (!newCauseText.trim()) return;

    // Check for duplicates
    const isDuplicate = isDuplicateCause(newCauseText, [
      ...causes,
      ...commonCausesData
    ], 0.85);

    if (isDuplicate) {
      setPendingCause({ text: newCauseText, category: selectedCategory });
      setShowDuplicateDialog(true);
      return;
    }

    await addCauseDirectly(newCauseText, selectedCategory);
  }, [newCauseText, selectedCategory, causes, commonCausesData]);

  const addCauseDirectly = async (text: string, category: string | null) => {
    const newCause: Cause = {
      descricao: text.trim(),
      categoria: category || null,
      isNew: true
    };

    const updatedCauses = [...causes, newCause];
    onChange(updatedCauses);

    // Save to database if riskId exists
    if (riskId) {
      try {
        const result = await createCause({
          risco_id: riskId,
          descricao: newCause.descricao,
          categoria: newCause.categoria
        });

        if (result.data) {
          // Update with the database ID
          const causesWithId = updatedCauses.map((c, idx) => 
            idx === updatedCauses.length - 1 ? { ...c, id: result.data.id, isNew: false } : c
          );
          onChange(causesWithId);
          toast.success('Causa adicionada com sucesso!');
        }
      } catch (error) {
        toast.error('Erro ao salvar causa');
        // Revert optimistic update
        onChange(causes);
      }
    }

    // Reset form
    setNewCauseText('');
    setSelectedCategory('');
    setShowSuggestions(false);
    setPendingCause(null);
    setShowDuplicateDialog(false);
  };

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: SimilarCause) => {
    setNewCauseText(suggestion.descricao);
    setSelectedCategory(suggestion.categoria || '');
    setShowSuggestions(false);
  }, []);

  // Edit cause inline
  const handleEditCause = useCallback(async (index: number, newText: string, newCategory: string | null) => {
    const cause = causes[index];
    if (!cause) return;

    setSavingStates(prev => new Set([...prev, index]));

    try {
      const updatedCause = {
        ...cause,
        descricao: newText.trim(),
        categoria: newCategory
      };

      const updatedCauses = causes.map((c, idx) => idx === index ? updatedCause : c);
      onChange(updatedCauses);

      // Update in database if exists
      if (cause.id && riskId) {
        await updateCause(cause.id, {
          descricao: updatedCause.descricao,
          categoria: updatedCause.categoria
        });
        toast.success('Causa atualizada!');
      }

      setEditingIndex(null);
    } catch (error) {
      toast.error('Erro ao atualizar causa');
      // Revert changes
      onChange(causes);
    } finally {
      setSavingStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  }, [causes, onChange, updateCause, riskId]);

  // Delete cause
  const handleDeleteCause = useCallback(async (index: number) => {
    const cause = causes[index];
    if (!cause) return;

    // Optimistic update
    const updatedCauses = causes.filter((_, idx) => idx !== index);
    onChange(updatedCauses);

    // Delete from database if exists
    if (cause.id) {
      try {
        await deleteCause(cause.id);
        toast.success('Causa removida!');
      } catch (error) {
        toast.error('Erro ao remover causa');
        // Revert optimistic update
        onChange(causes);
      }
    }
  }, [causes, onChange, deleteCause]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Causas do Risco</h3>
        <Badge variant="secondary" className="text-xs">
          {causes.length} causa{causes.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Add New Cause */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={newCauseText}
                  onChange={(e) => setNewCauseText(e.target.value)}
                  placeholder="Digite uma nova causa..."
                  className="pr-10"
                />
                {newCauseText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => {
                      setNewCauseText('');
                      setSelectedCategory('');
                      setShowSuggestions(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddCause}
                disabled={!newCauseText.trim() || loading}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Suggestions */}
            {showSuggestions && similarCauses.length > 0 && (
              <div className="border rounded-lg p-3 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Causas similares encontradas:</span>
                </div>
                <div className="space-y-2">
                  {similarCauses.slice(0, 3).map((suggestion, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-background rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{suggestion.descricao}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.similarity * 100)}% similar
                          </Badge>
                          {suggestion.categoria && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.categoria}
                            </Badge>
                          )}
                          {suggestion.frequency && (
                            <Badge variant="outline" className="text-xs">
                              {suggestion.frequency}x usado
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Causes */}
      {causes.length > 0 && (
        <div className="space-y-3">
          {causes.map((cause, index) => (
            <Card key={`${cause.id || 'new'}-${index}`} className="transition-all duration-200">
              <CardContent className="p-4">
                {editingIndex === index ? (
                  <EditingCauseForm
                    cause={cause}
                    onSave={(text, category) => handleEditCause(index, text, category)}
                    onCancel={() => setEditingIndex(null)}
                    saving={savingStates.has(index)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{cause.descricao}</span>
                        {cause.isNew && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Nova
                          </Badge>
                        )}
                      </div>
                      {cause.categoria && (
                        <Badge variant="secondary" className="text-xs">
                          {cause.categoria}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingIndex(index)}
                        disabled={savingStates.has(index)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCause(index)}
                        disabled={savingStates.has(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Duplicate Confirmation Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Possível Duplicata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Foi encontrada uma causa muito similar. Deseja adicionar mesmo assim ou usar uma existente?
            </p>
            {pendingCause && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">Nova causa:</p>
                <p className="text-sm">{pendingCause.text}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDuplicateDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (pendingCause) {
                    addCauseDirectly(pendingCause.text, pendingCause.category);
                  }
                }}
              >
                Adicionar Mesmo Assim
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Inline editing form component
interface EditingCauseFormProps {
  cause: Cause;
  onSave: (text: string, category: string | null) => void;
  onCancel: () => void;
  saving: boolean;
}

const EditingCauseForm: React.FC<EditingCauseFormProps> = ({
  cause,
  onSave,
  onCancel,
  saving
}) => {
  const [text, setText] = useState(cause.descricao);
  const [category, setCategory] = useState(cause.categoria || '');

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Descrição da causa..."
        rows={2}
        className="resize-none"
      />
      <div className="flex items-center gap-2">
        <Select value={category || "none"} onValueChange={(value) => setCategory(value === "none" ? "" : value)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem categoria</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => onSave(text, category || null)}
          disabled={!text.trim() || saving}
        >
          <Check className="w-4 h-4 mr-1" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
