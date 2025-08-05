import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserForm from './UserForm';

interface User {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  role: 'admin' | 'gestor' | 'analista' | 'visualizador';
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, editingUser }: UserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>
        <UserForm
          editingUser={editingUser}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}