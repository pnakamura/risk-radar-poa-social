
import { useState } from 'react';
import { useSupabaseRiskData } from './useSupabaseRiskData';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

export const useRiskActions = () => {
  const { updateRisk, deleteRisk } = useSupabaseRiskData();
  const [isLoading, setIsLoading] = useState(false);

  const editRisk = async (id: string, updates: Partial<Risk>) => {
    setIsLoading(true);
    try {
      const result = await updateRisk(id, updates);
      if (!result.error) {
        toast.success('Risco atualizado com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar risco:', error);
      toast.error('Erro ao atualizar risco');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeRisk = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteRisk(id);
      if (!result.error) {
        toast.success('Risco excluído com sucesso!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao excluir risco:', error);
      toast.error('Erro ao excluir risco');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editRisk,
    removeRisk,
    isLoading
  };
};
