import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const userSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  telefone: z.string().optional(),
  role: z.enum(['admin', 'gestor', 'analista', 'visualizador']),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  telefone?: string;
  role: 'admin' | 'gestor' | 'analista' | 'visualizador';
}

interface UserFormProps {
  editingUser?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'analista', label: 'Analista' },
  { value: 'visualizador', label: 'Visualizador' },
];

export default function UserForm({ editingUser, onSuccess, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingUser;

  const form = useForm<UserFormData>({
    resolver: zodResolver(
      isEditing 
        ? userSchema.omit({ password: true }) 
        : userSchema.refine(data => data.password && data.password.length >= 6, {
            message: "Senha é obrigatória para novos usuários",
            path: ["password"]
          })
    ),
    defaultValues: {
      nome: '',
      email: '',
      cargo: '',
      departamento: '',
      telefone: '',
      role: 'visualizador',
      password: '',
    },
  });

  useEffect(() => {
    if (editingUser) {
      form.reset({
        nome: editingUser.nome,
        email: editingUser.email,
        cargo: editingUser.cargo || '',
        departamento: editingUser.departamento || '',
        telefone: editingUser.telefone || '',
        role: editingUser.role,
      });
    }
  }, [editingUser, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('profiles')
          .update({
            nome: data.nome,
            email: data.email,
            cargo: data.cargo || null,
            departamento: data.departamento || null,
            telefone: data.telefone || null,
            role: data.role,
          })
          .eq('id', editingUser!.id);

        if (error) throw error;
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password!,
          options: {
            data: {
              nome: data.nome,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Atualizar o perfil com informações adicionais
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              nome: data.nome,
              cargo: data.cargo || null,
              departamento: data.departamento || null,
              telefone: data.telefone || null,
              role: data.role,
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  {...field}
                  disabled={isEditing} // Email não pode ser alterado
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="Cargo/Função" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Departamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função no Sistema *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      </form>
    </Form>
  );
}