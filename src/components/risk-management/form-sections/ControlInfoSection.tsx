
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RiskFormData } from '@/hooks/useRiskForm';
import { FieldHelpButton } from '@/components/risk-management/help/FieldHelpButton';
import { helpContent } from '@/components/risk-management/help/helpContent';

interface ProfileBasic {
  id: string;
  nome: string;
  email: string;
  cargo: string | null;
  departamento: string | null;
  role: string;
  telefone: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjetoBasic {
  id: string;
  nome: string;
  descricao: string | null;
}

interface ControlInfoSectionProps {
  formData: RiskFormData;
  onChange: (field: string, value: string) => void;
  profiles: ProfileBasic[];
  projects: ProjetoBasic[];
}

export const ControlInfoSection = ({ formData, onChange, profiles, projects }: ControlInfoSectionProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Controle e Monitoramento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="responsavel_id">Responsável</Label>
            <FieldHelpButton field="responsavel_id" content={helpContent.responsavel_id} />
          </div>
          <Select value={formData.responsavel_id} onValueChange={(value) => onChange('responsavel_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              {profiles.length === 0 ? (
                <SelectItem value="no-profiles" disabled>
                  Nenhum perfil disponível
                </SelectItem>
              ) : (
                profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.nome} - {profile.cargo || 'Sem cargo'}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="projeto_id">Projeto</Label>
            <FieldHelpButton field="projeto_id" content={helpContent.projeto_id} />
          </div>
          <Select value={formData.projeto_id} onValueChange={(value) => onChange('projeto_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.length === 0 ? (
                <SelectItem value="no-projects" disabled>
                  Nenhum projeto disponível
                </SelectItem>
              ) : (
                projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.nome}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="prazo">Prazo</Label>
          <FieldHelpButton field="prazo" content={helpContent.prazo} />
        </div>
        <Input
          id="prazo"
          type="date"
          value={formData.prazo}
          onChange={(e) => onChange('prazo', e.target.value)}
        />
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="status">Status</Label>
          <FieldHelpButton field="status" content={helpContent.status} />
        </div>
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
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="observacoes">Observações</Label>
          <FieldHelpButton field="observacoes" content={helpContent.observacoes} />
        </div>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => onChange('observacoes', e.target.value)}
          placeholder="Observações adicionais sobre o risco..."
          rows={3}
        />
      </div>
    </div>
  );
};
