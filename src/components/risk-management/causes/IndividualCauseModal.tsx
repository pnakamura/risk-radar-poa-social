import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Trash2, 
  AlertTriangle, 
  History, 
  TrendingUp, 
  Target,
  Building2,
  User,
  Calendar
} from 'lucide-react';
import { useCausesData } from '@/hooks/useCausesData';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { toast } from 'sonner';

interface IndividualCauseModalProps {
  cause: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedCause: any) => void;
  onDelete?: (causeId: string) => void;
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

export const IndividualCauseModal: React.FC<IndividualCauseModalProps> = ({
  cause,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { updateCause, deleteCause, causes } = useCausesData();
  const { risks } = useSupabaseRiskData();
  
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [affectedRisks, setAffectedRisks] = useState<any[]>([]);

  // Load cause data when modal opens
  useEffect(() => {
    if (cause) {
      setFormData({
        descricao: cause.causa_descricao || cause.descricao || '',
        categoria: cause.categorias?.[0] || cause.categoria || ''
      });

      // Find affected risks
      const relatedCauses = causes.filter(c => 
        c.descricao.toLowerCase() === (cause.causa_descricao || cause.descricao || '').toLowerCase()
      );
      
      const riskIds = relatedCauses.map(c => c.risco_id);
      const relatedRisks = risks.filter(risk => riskIds.includes(risk.id));
      setAffectedRisks(relatedRisks);
    }
  }, [cause, causes, risks]);

  // Handle save
  const handleSave = async () => {
    if (!cause || !formData.descricao.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    setSaving(true);
    try {
      // Find all causes with the same description to update them all
      const causesToUpdate = causes.filter(c => 
        c.descricao.toLowerCase() === (cause.causa_descricao || cause.descricao || '').toLowerCase()
      );

      // Update all matching causes
      const updatePromises = causesToUpdate.map(c => 
        updateCause(c.id, {
          descricao: formData.descricao.trim(),
          categoria: formData.categoria || null
        })
      );

      await Promise.all(updatePromises);

      toast.success(`${causesToUpdate.length} causa(s) atualizada(s) com sucesso!`);
      onSave?.(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar causa:', error);
      toast.error('Erro ao salvar causa');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!cause) return;

    setDeleting(true);
    try {
      // Find all causes with the same description
      const causesToDelete = causes.filter(c => 
        c.descricao.toLowerCase() === (cause.causa_descricao || cause.descricao || '').toLowerCase()
      );

      // Delete all matching causes
      const deletePromises = causesToDelete.map(c => deleteCause(c.id));
      await Promise.all(deletePromises);

      toast.success(`${causesToDelete.length} causa(s) removida(s) com sucesso!`);
      onDelete?.(cause.id || cause.causa_descricao);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar causa:', error);
      toast.error('Erro ao deletar causa');
    } finally {
      setDeleting(false);
    }
  };

  if (!cause) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Gerenciar Causa Individual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Descrição da Causa</label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva a causa do risco..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select 
                value={formData.categoria || "none"} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value === "none" ? null : value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          {cause.frequencia && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Estatísticas da Causa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{cause.frequencia}</div>
                    <div className="text-xs text-muted-foreground">Frequência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{cause.riscos_alto_impacto || 0}</div>
                    <div className="text-xs text-muted-foreground">Alto Impacto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{cause.riscos_medio_impacto || 0}</div>
                    <div className="text-xs text-muted-foreground">Médio Impacto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{cause.riscos_baixo_impacto || 0}</div>
                    <div className="text-xs text-muted-foreground">Baixo Impacto</div>
                  </div>
                </div>

                {cause.score_final && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Score Final:</span>
                      <Badge variant="secondary" className="text-base">
                        {cause.score_final.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Affected Risks */}
          {affectedRisks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Riscos Afetados ({affectedRisks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Alterações nesta causa afetarão todos os riscos listados abaixo.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {affectedRisks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold">{risk.codigo}</span>
                          <Badge variant="outline" className="text-xs">
                            {risk.nivel_risco}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {risk.descricao_risco}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {risk.responsavel && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {risk.responsavel.nome}
                            </div>
                          )}
                          {risk.projeto && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {risk.projeto.nome}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Removendo...' : 'Remover Causa'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || deleting || !formData.descricao.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};