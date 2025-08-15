import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, FolderOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Project {
  id: string;
  nome: string;
  descricao?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  gestor_id?: string;
  created_at: string;
  profiles?: {
    nome: string;
  };
}

interface ProjectListProps {
  onEditProject?: (project: Project) => void;
  refreshTrigger?: number;
}

const ProjectList = ({ onEditProject, refreshTrigger }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [linkedRisks, setLinkedRisks] = useState<any[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [reassignProjectId, setReassignProjectId] = useState<string>('');
  const [showReassignOption, setShowReassignOption] = useState(false);
  const { canManageProjects } = usePermissions();

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          profiles:gestor_id (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar projetos:', error);
        toast.error('Erro ao carregar projetos');
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const checkLinkedRisks = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('id, codigo, descricao_risco')
        .eq('projeto_id', projectId);

      if (error) {
        console.error('Erro ao verificar riscos vinculados:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado:', error);
      return [];
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete || !canManageProjects) return;

    try {
      // Se há riscos vinculados e foi escolhido reatribuir
      if (linkedRisks.length > 0 && showReassignOption && reassignProjectId) {
        const { error: reassignError } = await supabase
          .from('riscos')
          .update({ projeto_id: reassignProjectId === 'none' ? null : reassignProjectId })
          .eq('projeto_id', projectToDelete.id);

        if (reassignError) {
          console.error('Erro ao reatribuir riscos:', reassignError);
          toast.error('Erro ao reatribuir riscos');
          return;
        }
      }

      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) {
        console.error('Erro ao deletar projeto:', error);
        toast.error('Erro ao deletar projeto: ' + error.message);
        return;
      }

      toast.success(linkedRisks.length > 0 
        ? 'Projeto deletado e riscos reatribuídos com sucesso!' 
        : 'Projeto deletado com sucesso!');
      
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setLinkedRisks([]);
      setShowReassignOption(false);
      setReassignProjectId('');
      fetchProjects();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao deletar projeto');
    }
  };

  const openDeleteDialog = async (project: Project) => {
    setProjectToDelete(project);
    
    // Verificar riscos vinculados
    const risks = await checkLinkedRisks(project.id);
    setLinkedRisks(risks);
    
    // Se há riscos, buscar projetos disponíveis para reatribuição
    if (risks.length > 0) {
      const otherProjects = projects.filter(p => p.id !== project.id);
      setAvailableProjects(otherProjects);
      setShowReassignOption(false);
      setReassignProjectId('');
    }
    
    setDeleteDialogOpen(true);
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'default';
      case 'inativo':
        return 'secondary';
      case 'concluído':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Projetos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Projetos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Nenhum projeto encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Projetos Cadastrados ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Gestor</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                {canManageProjects && <TableHead className="w-[70px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.nome}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {project.descricao || '-'}
                  </TableCell>
                  <TableCell>{project.profiles?.nome || '-'}</TableCell>
                  <TableCell>{formatDate(project.data_inicio)}</TableCell>
                  <TableCell>{formatDate(project.data_fim)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status || 'Ativo'}
                    </Badge>
                  </TableCell>
                  {canManageProjects && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditProject?.(project)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(project)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
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
        <AlertDialogContent className="sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {linkedRisks.length > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              {linkedRisks.length > 0 ? (
                <div className="space-y-3">
                  <p>
                    O projeto "{projectToDelete?.nome}" possui <strong>{linkedRisks.length} risco(s)</strong> vinculado(s):
                  </p>
                  <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                    {linkedRisks.map((risk) => (
                      <div key={risk.id} className="text-sm">
                        • {risk.codigo} - {risk.descricao_risco}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Para continuar, você pode reatribuir os riscos para outro projeto ou removê-los do projeto.
                  </p>
                  
                  {!showReassignOption ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowReassignOption(true)}
                      >
                        Reatribuir Riscos
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setReassignProjectId('none');
                          setShowReassignOption(true);
                        }}
                      >
                        Remover dos Riscos
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {reassignProjectId === 'none' ? 'Confirme a remoção dos riscos:' : 'Selecione o novo projeto:'}
                      </label>
                      {reassignProjectId !== 'none' && (
                        <Select value={reassignProjectId} onValueChange={setReassignProjectId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um projeto" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowReassignOption(false);
                          setReassignProjectId('');
                        }}
                      >
                        Voltar
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p>
                  Tem certeza que deseja deletar o projeto "{projectToDelete?.nome}"? 
                  Esta ação não pode ser desfeita.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProject} 
              disabled={linkedRisks.length > 0 && !showReassignOption}
              className="bg-destructive text-destructive-foreground"
            >
              {linkedRisks.length > 0 && showReassignOption
                ? (reassignProjectId === 'none' ? 'Remover e Deletar' : 'Reatribuir e Deletar')
                : 'Deletar'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProjectList;