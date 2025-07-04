
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FolderOpen, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';

interface ProjectFormData {
  nome: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  gestor_id: string;
}

const ProjectForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuth();
  const { profiles } = useSupabaseRiskData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    status: 'Ativo',
    gestor_id: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!formData.nome) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('projetos')
        .insert({
          nome: formData.nome,
          descricao: formData.descricao || null,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          status: formData.status,
          gestor_id: formData.gestor_id || null
        });

      if (error) {
        console.error('Erro ao salvar projeto:', error);
        toast.error('Erro ao salvar projeto: ' + error.message);
        return;
      }

      toast.success('Projeto criado com sucesso!');
      setFormData({
        nome: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        status: 'Ativo',
        gestor_id: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao salvar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Cadastro de Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Projeto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Nome do projeto"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição do projeto..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => handleChange('data_inicio', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => handleChange('data_fim', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="gestor_id">Gestor do Projeto</Label>
              <Select value={formData.gestor_id} onValueChange={(value) => handleChange('gestor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
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
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
