import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';
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
  created_at: string;
}

interface ProfileListProps {
  onEditProfile?: (profile: Profile) => void;
  refreshTrigger?: number;
}

const ProfileList = ({ onEditProfile, refreshTrigger }: ProfileListProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const { canManageProfiles, profile: currentProfile } = usePermissions();

  useEffect(() => {
    fetchProfiles();
  }, [refreshTrigger]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar perfis:', error);
        toast.error('Erro ao carregar perfis');
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete || !canManageProfiles) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileToDelete.id);

      if (error) {
        console.error('Erro ao deletar perfil:', error);
        toast.error('Erro ao deletar perfil');
        return;
      }

      toast.success('Perfil deletado com sucesso!');
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
      fetchProfiles();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao deletar perfil');
    }
  };

  const openDeleteDialog = (profile: Profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'gestor':
        return 'default';
      case 'analista':
        return 'secondary';
      case 'visualizador':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'gestor':
        return 'Gestor';
      case 'analista':
        return 'Analista';
      case 'visualizador':
        return 'Visualizador';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pessoas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pessoas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Nenhuma pessoa encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Pessoas Cadastradas ({profiles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Papel</TableHead>
                {canManageProfiles && <TableHead className="w-[70px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.nome}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.cargo || '-'}</TableCell>
                  <TableCell>{profile.departamento || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                      {getRoleDisplay(profile.role)}
                    </Badge>
                  </TableCell>
                  {canManageProfiles && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditProfile?.(profile)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {profile.id !== currentProfile?.id && (
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(profile)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o perfil de {profileToDelete?.nome}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProfileList;