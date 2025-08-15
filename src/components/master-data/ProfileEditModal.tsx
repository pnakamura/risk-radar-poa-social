import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

interface Profile {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  role: 'admin' | 'gestor' | 'analista' | 'visualizador';
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profile: Profile | null;
}

const ProfileEditModal = ({ isOpen, onClose, onSuccess, profile }: ProfileEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    departamento: '',
    telefone: '',
    role: 'visualizador' as 'admin' | 'gestor' | 'analista' | 'visualizador'
  });
  const { canManageProfiles } = usePermissions();

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome,
        email: profile.email,
        cargo: profile.cargo || '',
        departamento: profile.departamento || '',
        telefone: profile.telefone || '',
        role: profile.role
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !canManageProfiles) return;

    if (!formData.nome || !formData.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          email: formData.email,
          cargo: formData.cargo || null,
          departamento: formData.departamento || null,
          telefone: formData.telefone || null,
          role: formData.role
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast.error('Erro ao atualizar perfil: ' + error.message);
        return;
      }

      toast.success('Perfil atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao atualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageProfiles) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleChange('cargo', e.target.value)}
                placeholder="Ex: Analista, Gerente..."
              />
            </div>
            
            <div>
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => handleChange('departamento', e.target.value)}
                placeholder="Ex: TI, RH, Financeiro..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Papel no Sistema</Label>
              <Select value={formData.role} onValueChange={(value: any) => handleChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
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

export default ProfileEditModal;