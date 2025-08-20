
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRiskActions } from '@/hooks/useRiskActions';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { Constants } from '@/integrations/supabase/types';
import { calculateRiskLevel } from '@/utils/riskCalculations';
import { Database } from '@/integrations/supabase/types';
import { IntelligentCauseEditor } from './causes/IntelligentCauseEditor';
import { useCausesData } from '@/hooks/useCausesData';

// Usando o tipo correto do Supabase
type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface Cause {
  id?: string;
  descricao: string;
  categoria: string | null;
}

interface RiskEditModalProps {
  risk: Risk | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RiskEditModal = ({ risk, isOpen, onClose, onSuccess }: RiskEditModalProps) => {
  const { editRisk, isLoading } = useRiskActions();
  const { profiles, projects } = useSupabaseRiskData();
  const { getCausesForRisk, loading: causesLoading } = useCausesData();
  const [formData, setFormData] = useState<Partial<Risk>>({});
  const [causes, setCauses] = useState<Cause[]>([]);
  const [causesLoaded, setCausesLoaded] = useState(false);

  // Aguardar carregamento das causas antes de carregar as do risco específico
  useEffect(() => {
    if (risk && isOpen && !causesLoading) {
      console.log('🔄 [RiskEditModal] Loading causes for risk:', risk.id);
      const existingCauses = getCausesForRisk(risk.id);
      const formattedCauses = existingCauses.map(cause => ({
        id: cause.id,
        descricao: cause.descricao,
        categoria: cause.categoria
      }));
      
      setCauses(formattedCauses);
      setCausesLoaded(true);
      console.log(`✅ [RiskEditModal] Loaded ${formattedCauses.length} causes for risk ${risk.id}`);
    }
  }, [risk, isOpen, causesLoading, getCausesForRisk]);

  useEffect(() => {
    if (risk && isOpen) {
      setFormData({
        codigo: risk.codigo || '',
        categoria: risk.categoria,
        descricao_risco: risk.descricao_risco || '',
        causas: risk.causas || '',
        consequencias: risk.consequencias || '',
        probabilidade: risk.probabilidade,
        impacto: risk.impacto,
        estrategia: risk.estrategia,
        acoes_mitigacao: risk.acoes_mitigacao || '',
        acoes_contingencia: risk.acoes_contingencia || '',
        responsavel_id: risk.responsavel_id || null,
        projeto_id: risk.projeto_id || null,
        prazo: risk.prazo || '',
        status: risk.status,
        observacoes: risk.observacoes || ''
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({});
      setCauses([]);
      setCausesLoaded(false);
    }
  }, [risk, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!risk) return;

    // Calcular novo nível de risco se probabilidade ou impacto mudaram
    const nivel_risco = calculateRiskLevel(
      formData.probabilidade as Database['public']['Enums']['risk_probability'], 
      formData.impacto as Database['public']['Enums']['risk_impact']
    );
    
    const updates = {
      ...formData,
      nivel_risco,
      responsavel_id: formData.responsavel_id || null,
      projeto_id: formData.projeto_id || null,
      prazo: formData.prazo || null
    };

    const success = await editRisk(risk.id, updates);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  const handleChange = (field: string, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // Don't render if no risk provided
  if (!risk) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Risco - {risk.codigo}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo || ''}
                onChange={(e) => handleChange('codigo', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria as string || ''} 
                onValueChange={(value) => handleChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.risk_category.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao_risco">Nome do Risco</Label>
            <Textarea
              id="descricao_risco"
              value={formData.descricao_risco || ''}
              onChange={(e) => handleChange('descricao_risco', e.target.value)}
              rows={3}
              required
              maxLength={150}
              placeholder="Digite um nome claro e objetivo para o risco"
            />
          </div>

          {/* Enhanced Causes Section */}
          {causesLoading ? (
            <div className="space-y-2">
              <Label>Causas do Risco</Label>
              <div className="animate-pulse bg-muted h-24 rounded"></div>
            </div>
          ) : (
            <IntelligentCauseEditor 
              riskId={risk.id}
              causes={causes}
              onChange={setCauses}
            />
          )}

          <div>
            <Label htmlFor="consequencias">Consequências</Label>
            <Textarea
              id="consequencias"
              value={formData.consequencias || ''}
              onChange={(e) => handleChange('consequencias', e.target.value)}
              rows={2}
              placeholder="Descreva as possíveis consequências do risco"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="probabilidade">Probabilidade</Label>
              <Select 
                value={formData.probabilidade as string || ''} 
                onValueChange={(value) => handleChange('probabilidade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a probabilidade" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.risk_probability.map(prob => (
                    <SelectItem key={prob} value={prob}>{prob}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="impacto">Impacto</Label>
              <Select 
                value={formData.impacto as string || ''} 
                onValueChange={(value) => handleChange('impacto', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o impacto" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.risk_impact.map(impact => (
                    <SelectItem key={impact} value={impact}>{impact}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estrategia">Estratégia</Label>
              <Select 
                value={formData.estrategia as string || ''} 
                onValueChange={(value) => handleChange('estrategia', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a estratégia" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.risk_strategy.map(strategy => (
                    <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status as string || ''} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Constants.public.Enums.risk_status.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsavel_id">Responsável</Label>
              <Select 
                value={formData.responsavel_id as string || 'none'} 
                onValueChange={(value) => handleChange('responsavel_id', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>{profile.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="projeto_id">Projeto</Label>
              <Select 
                value={formData.projeto_id as string || 'none'} 
                onValueChange={(value) => handleChange('projeto_id', value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="prazo">Prazo</Label>
            <Input
              id="prazo"
              type="date"
              value={formData.prazo || ''}
              onChange={(e) => handleChange('prazo', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="acoes_mitigacao">Ações de Mitigação</Label>
            <Textarea
              id="acoes_mitigacao"
              value={formData.acoes_mitigacao || ''}
              onChange={(e) => handleChange('acoes_mitigacao', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="acoes_contingencia">Ações de Contingência</Label>
            <Textarea
              id="acoes_contingencia"
              value={formData.acoes_contingencia || ''}
              onChange={(e) => handleChange('acoes_contingencia', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
