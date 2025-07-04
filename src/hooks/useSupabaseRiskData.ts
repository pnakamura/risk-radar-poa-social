
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
  const [profiles, setProfiles] = useState<ProfileBasic[]>([]);
  const [projects, setProjects] = useState<ProjetoBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, cargo, departamento, role, telefone, created_at, updated_at')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar perfis:', error);
        toast.error('Erro ao carregar perfis');
      } else {
        console.log('Profiles fetched:', data);
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar perfis:', error);
      toast.error('Erro inesperado ao carregar perfis');
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      const { data, error } = await supabase
        .from('projetos')
        .select('id, nome, descricao')
        .order('nome');

      if (error) {
        console.error('Erro ao buscar projetos:', error);
        toast.error('Erro ao carregar projetos');
      } else {
        console.log('Projects fetched:', data);
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar projetos:', error);
      toast.error('Erro inesperado ao carregar projetos');
    }
  };

  const fetchRisks = async () => {
    setLoading(true);
    try {
      console.log('Fetching risks...');
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
        console.error('Erro ao buscar riscos:', error);
        toast.error('Erro ao carregar riscos: ' + error.message);
        setRisks([]);
      } else {
        console.log('Risks fetched:', data);
        setRisks(data || []);
      }
    } catch (error) {
      console.error('Erro inesperado ao buscar riscos:', error);
      toast.error('Erro inesperado ao carregar riscos');
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
      console.log('Creating risk with data:', riskData);
      const { data, error } = await supabase
        .from('riscos')
        .insert({
          ...riskData,
          criado_por: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar risco:', error);
        toast.error('Erro ao criar risco: ' + error.message);
        return { error };
      }

      console.log('Risk created successfully:', data);
      toast.success('Risco criado com sucesso!');
      await fetchRisks(); // Recarregar a lista
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar risco:', error);
      toast.error('Erro inesperado ao criar risco');
      return { error };
    }
  };

  const updateRisk = async (id: string, updates: Partial<NewRisk>) => {
    try {
      console.log('Updating risk:', id, updates);
      const { data, error } = await supabase
        .from('riscos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar risco:', error);
        toast.error('Erro ao atualizar risco: ' + error.message);
        return { error };
      }

      console.log('Risk updated successfully:', data);
      toast.success('Risco atualizado com sucesso!');
      await fetchRisks(); // Recarregar a lista
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar risco:', error);
      toast.error('Erro inesperado ao atualizar risco');
      return { error };
    }
  };

  const deleteRisk = async (id: string) => {
    try {
      console.log('Deleting risk:', id);
      const { error } = await supabase
        .from('riscos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar risco:', error);
        toast.error('Erro ao deletar risco: ' + error.message);
        return { error };
      }

      console.log('Risk deleted successfully');
      toast.success('Risco deletado com sucesso!');
      await fetchRisks(); // Recarregar a lista
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado ao deletar risco:', error);
      toast.error('Erro inesperado ao deletar risco');
      return { error };
    }
  };

  const refreshData = () => {
    console.log('Refreshing all data...');
    fetchRisks();
  };

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching data...');
      fetchRisks();
      fetchProfiles();
      fetchProjects();
    } else {
      console.log('User not authenticated');
    }
  }, [user]);

  // Configurar realtime updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime channel...');
    const channel = supabase
      .channel('riscos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'riscos'
        },
        (payload) => {
          console.log('Realtime change detected:', payload);
          fetchRisks(); // Recarregar quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      console.log('Removing realtime channel...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    risks,
    profiles,
    projects,
    loading,
    refreshData,
    createRisk,
    updateRisk,
    deleteRisk,
  };
};
