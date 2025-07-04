
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

interface Risk {
  id: string;
  codigo: string;
  categoria: string;
  descricao_risco: string;
  causas?: string;
  consequencias?: string;
  probabilidade: string;
  impacto: string;
  nivel_risco: string;
  estrategia: string;
  acoes_mitigacao?: string;
  acoes_contingencia?: string;
  responsavel_id?: string;
  projeto_id?: string;
  prazo?: string;
  status: string;
  observacoes?: string;
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
  const [formData, setFormData] = useState<Partial<Risk>>({});

  useEffect(() => {
    if (risk) {
      setFormData({
        codigo: risk.codigo,
        categoria: risk.categoria,
        descricao_risco: risk.descricao_risco,
        causas: risk.causas || '',
        consequencias: risk.consequencias || '',
        probabilidade: risk.probabilidade,
        impacto: risk.impacto,
        estrategia: risk.estrategia,
        acoes_mitigacao: risk.acoes_mitigacao || '',
        acoes_contingencia: risk.acoes_contingencia || '',
        responsavel_id: risk.responsavel_id || '',
        projeto_id: risk.projeto_id || '',
        prazo: risk.prazo || '',
        status: risk.status,
        observacoes: risk.observacoes || ''
      });
    }
  }, [risk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!risk) return;

    // Calcular novo nível de risco se probabilidade ou impacto mudaram
    const nivel_risco = calculateRiskLevel(formData.probabilidade!, formData.impacto!);
    
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!risk) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
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
            <Label htmlFor="descricao_risco">Descrição do Risco</Label>
            <Textarea
              id="descricao_risco"
              value={formData.descricao_risco || ''}
              onChange={(e) => handleChange('descricao_risco', e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="probabilidade">Probabilidade</Label>
              <Select value={formData.probabilidade} onValueChange={(value) => handleChange('probabilidade', value)}>
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
              <Select value={formData.impacto} onValueChange={(value) => handleChange('impacto', value)}>
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
              <Select value={formData.estrategia} onValueChange={(value) => handleChange('estrategia', value)}>
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
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
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
              <Select value={formData.responsavel_id} onValueChange={(value) => handleChange('responsavel_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>{profile.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="projeto_id">Projeto</Label>
              <Select value={formData.projeto_id} onValueChange={(value) => handleChange('projeto_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
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
