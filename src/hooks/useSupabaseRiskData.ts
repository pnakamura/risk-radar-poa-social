
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

type ProfileBasic = {
  id: string;
  nome: string;
  email: string;
  cargo: string | null;
  departamento: string | null;
  role: Database['public']['Enums']['user_role'];
  telefone: string | null;
  created_at: string;
  updated_at: string;
};

type ProjetoBasic = {
  id: string;
  nome: string;
  descricao: string | null;
};

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: ProfileBasic | null;
  projeto?: ProjetoBasic | null;
  criador?: ProfileBasic | null;
};

type NewRisk = Database['public']['Tables']['riscos']['Insert'];

export const useSupabaseRiskData = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select(`
          *,
          responsavel:profiles!riscos_responsavel_id_fkey(id, nome, email, cargo, departamento, role, telefone, created_at, updated_at),
          projeto:projetos(id, nome, descricao),
          criador:profiles!riscos_criado_por_fkey(id, nome, email, cargo, departamento, role, telefone, created_at, updated_at)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erro ao carregar riscos: ' + error.message);
        console.error('Erro ao buscar riscos:', error);
        setRisks([]);
      } else {
        setRisks(data || []);
      }
    } catch (error) {
      toast.error('Erro inesperado ao carregar riscos');
      console.error('Erro inesperado:', error);
      setRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const createRisk = async (riskData: Omit<NewRisk, 'criado_por'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { error: 'Usuário não autenticado' };
    }

    try {
      const { data, error } = await supabase
        .from('riscos')
        .insert({
          ...riskData,
          criado_por: user.id,
        })
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar risco: ' + error.message);
        return { error };
      }

      toast.success('Risco criado com sucesso!');
      await fetchRisks(); // Recarregar a lista
      return { data, error: null };
    } catch (error) {
      toast.error('Erro inesperado ao criar risco');
      return { error };
    }
  };

  const updateRisk = async (id: string, updates: Partial<NewRisk>) => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar risco: ' + error.message);
        return { error };
      }

      toast.success('Risco atualizado com sucesso!');
      await fetchRisks(); // Recarregar a lista
      return { data, error: null };
    } catch (error) {
      toast.error('Erro inesperado ao atualizar risco');
      return { error };
    }
  };

  const deleteRisk = async (id: string) => {
    try {
      const { error } = await supabase
        .from('riscos')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao deletar risco: ' + error.message);
        return { error };
      }

      toast.success('Risco deletado com sucesso!');
      await fetchRisks(); // Recarregar a lista
      return { error: null };
    } catch (error) {
      toast.error('Erro inesperado ao deletar risco');
      return { error };
    }
  };

  const refreshData = () => {
    fetchRisks();
  };

  useEffect(() => {
    if (user) {
      fetchRisks();
    }
  }, [user]);

  // Configurar realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('riscos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'riscos'
        },
        () => {
          fetchRisks(); // Recarregar quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    risks,
    loading,
    refreshData,
    createRisk,
    updateRisk,
    deleteRisk,
  };
};
