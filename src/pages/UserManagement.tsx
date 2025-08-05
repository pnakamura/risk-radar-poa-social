import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs';
import UserList from '@/components/user-management/UserList';
import UserModal from '@/components/user-management/UserModal';

export default function UserManagement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Verificar se o usuário tem permissão para gerenciar usuários
  if (profile?.role !== 'admin' && profile?.role !== 'gestor') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    handleCloseModal();
    toast.success(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
  };

  const handleGoBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumbs inteligentes */}
      <SmartBreadcrumbs />
      
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGoBack}
          className="gap-2 hover-lift"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1" />
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões
          </p>
        </div>
        <Button onClick={handleCreateUser} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <UserList 
            onEditUser={handleEditUser}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        editingUser={editingUser}
      />
    </div>
  );
}