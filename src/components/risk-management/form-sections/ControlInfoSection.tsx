
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RiskFormData } from '@/hooks/useRiskForm';

interface ControlInfoSectionProps {
  formData: RiskFormData;
  onChange: (field: string, value: string) => void;
  profiles: Array<{
    id: string;
    nome: string;
    cargo: string | null;
  }>;
  projects: Array<{
    id: string;
    nome: string;
  }>;
}

export const ControlInfoSection = ({ formData, onChange, profiles, projects }: ControlInfoSectionProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Informações de Controle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="responsavel_id">Responsável</Label>
          <Select value={formData.responsavel_id} onValueChange={(value) => onChange('responsavel_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum responsável</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.nome} - {profile.cargo || 'Sem cargo'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="prazo">Prazo</Label>
          <Input
            id="prazo"
            type="date"
            value={formData.prazo}
            onChange={(e) => onChange('prazo', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => onChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Identificado">Identificado</SelectItem>
              <SelectItem value="Em Análise">Em Análise</SelectItem>
              <SelectItem value="Em Monitoramento">Em Monitoramento</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Mitigado">Mitigado</SelectItem>
              <SelectItem value="Aceito">Aceito</SelectItem>
              <SelectItem value="Transferido">Transferido</SelectItem>
              <SelectItem value="Eliminado">Eliminado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4">
        <Label htmlFor="projeto_id">Projeto</Label>
        <Select value={formData.projeto_id} onValueChange={(value) => onChange('projeto_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum projeto</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => onChange('observacoes', e.target.value)}
          placeholder="Observações adicionais sobre o risco..."
        />
      </div>
    </div>
  );
};
