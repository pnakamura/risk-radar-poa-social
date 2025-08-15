import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

interface Project {
  id: string;
  nome: string;
  descricao?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  gestor_id?: string;
}

interface Profile {
  id: string;
  nome: string;
}

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

const ProjectEditModal = ({ isOpen, onClose, onSuccess, project }: ProjectEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'Ativo',
    data_inicio: '',
    data_fim: '',
    gestor_id: ''
  });
  const { canManageProjects } = usePermissions();

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (project) {
      setFormData({
        nome: project.nome,
        descricao: project.descricao || '',
        status: project.status || 'Ativo',
        data_inicio: project.data_inicio || '',
        data_fim: project.data_fim || '',
        gestor_id: project.gestor_id || ''
      });
    }
  }, [project]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar perfis:', error);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !canManageProjects) return;

    if (!formData.nome) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('projetos')
        .update({
          nome: formData.nome,
          descricao: formData.descricao || null,
          status: formData.status,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          gestor_id: formData.gestor_id || null
        })
        .eq('id', project.id);

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        toast.error('Erro ao atualizar projeto: ' + error.message);
        return;
      }

      toast.success('Projeto atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao atualizar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageProjects) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>
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
              placeholder="Descrição do projeto"
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
              <Label htmlFor="gestor_id">Gestor Responsável</Label>
              <Select value={formData.gestor_id} onValueChange={(value) => handleChange('gestor_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.nome}
                    </SelectItem>
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
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditModal;