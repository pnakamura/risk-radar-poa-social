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
      console.log('[Supabase][profiles] Teste de query mínima...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('[Supabase][profiles] Erro na query mínima:', {
          message: testError.message,
          code: (testError as any).code,
          details: (testError as any).details,
          hint: (testError as any).hint,
        });
      } else {
        console.log('[Supabase][profiles] Query mínima OK. Registros retornados:', testData?.length ?? 0);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, cargo, departamento, role, telefone, created_at, updated_at')
        .order('nome');

      if (error) {
        console.error('[Supabase][profiles] Erro ao buscar perfis completos:', {
          message: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
        });
        toast.error('Erro ao carregar perfis: ' + error.message);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('[Supabase][profiles] Erro inesperado ao buscar perfis:', error);
      toast.error('Erro inesperado ao carregar perfis');
      setProfiles([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('id, nome, descricao')
        .order('nome');

      if (error) {
        console.error('[Supabase][projetos] Erro ao buscar projetos:', {
          message: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
        });
        toast.error('Erro ao carregar projetos: ' + error.message);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('[Supabase][projetos] Erro inesperado ao buscar projetos:', error);
      toast.error('Erro inesperado ao carregar projetos');
      setProjects([]);
    }
  };

  const fetchRisks = async () => {
    setLoading(true);
    try {
      // Buscar riscos primeiro
      const { data: riscosData, error: riscosError } = await supabase
        .from('riscos')
        .select('*')
        .order('created_at', { ascending: false });

      if (riscosError) {
        console.error('Erro ao buscar riscos:', riscosError);
        toast.error('Erro ao carregar riscos: ' + riscosError.message);
        setRisks([]);
        setLoading(false);
        return;
      }

      if (!riscosData || riscosData.length === 0) {
        setRisks([]);
        setLoading(false);
        return;
      }

      // Buscar perfis relacionados
      const responsavelIds = riscosData.map(r => r.responsavel_id).filter(Boolean);
      const criadorIds = riscosData.map(r => r.criado_por).filter(Boolean);
      const allProfileIds = [...new Set([...responsavelIds, ...criadorIds])];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome, email, cargo, departamento, role, telefone, created_at, updated_at')
        .in('id', allProfileIds);

      if (profilesError) {
        console.error('[Supabase][riscos] Erro ao buscar perfis relacionados:', {
          message: profilesError.message,
          code: (profilesError as any).code,
          details: (profilesError as any).details,
          hint: (profilesError as any).hint,
        });
      }

      // Buscar projetos relacionados
      const projetoIds = riscosData.map(r => r.projeto_id).filter(Boolean);
      let projetosData: ProjetoBasic[] | null = [];

      if (projetoIds.length > 0) {
        const { data, error: projetosError } = await supabase
          .from('projetos')
          .select('id, nome, descricao')
          .in('id', projetoIds);

        if (projetosError) {
          console.error('[Supabase][riscos] Erro ao buscar projetos relacionados:', {
            message: projetosError.message,
            code: (projetosError as any).code,
            details: (projetosError as any).details,
            hint: (projetosError as any).hint,
          });
        }

        projetosData = (data as any) || [];
      }

      // Mapear dados relacionados
      const profilesMap = new Map<string, ProfileBasic>(
        (profilesData || []).map(p => [p.id, p])
      );
      const projetosMap = new Map<string, ProjetoBasic>(
        (projetosData || []).map(p => [p.id, p])
      );

      const enrichedRisks: Risk[] = riscosData.map(risco => ({
        ...risco,
        responsavel: risco.responsavel_id ? (profilesMap.get(risco.responsavel_id) || null) : null,
        criador: risco.criado_por ? (profilesMap.get(risco.criado_por) || null) : null,
        projeto: risco.projeto_id ? (projetosMap.get(risco.projeto_id) || null) : null,
      }));

      setRisks(enrichedRisks);
    } catch (error) {
      console.error('Erro inesperado ao buscar riscos:', error);
      toast.error('Erro inesperado ao carregar riscos');
      setRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const createRisk = async (riskData: NewRisk) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { error: 'Usuário não autenticado' };
    }

    try {
      console.log('Creating risk with data:', riskData);
      
      // Garantir que criado_por está definido
      const dataWithCreator = {
        ...riskData,
        criado_por: user.id,
      };

      console.log('Final risk data with creator:', dataWithCreator);

      const { data, error } = await supabase
        .from('riscos')
        .insert(dataWithCreator)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar risco:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('row-level security policy')) {
          toast.error('Erro de permissão: Você não tem autorização para criar riscos. Verifique sua role de usuário.');
        } else if (error.message.includes('violates unique constraint')) {
          toast.error('Erro: Já existe um risco com este código.');
        } else {
          toast.error('Erro ao criar risco: ' + error.message);
        }
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
    fetchRisks();
  };

  useEffect(() => {
    if (user) {
      fetchRisks();
      fetchProfiles();
      fetchProjects();
    } else {
      setRisks([]);
      setProfiles([]);
      setProjects([]);
      setLoading(false);
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
        (payload) => {
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
    profiles,
    projects,
    loading,
    refreshData,
    createRisk,
    updateRisk,
    deleteRisk,
  };
};
