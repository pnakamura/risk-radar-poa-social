import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface RiskCause {
  id: string;
  risco_id: string;
  descricao: string;
  categoria: string | null;
  created_at: string;
  updated_at: string;
}

interface CommonCauseAnalysis {
  causa_descricao: string;
  frequencia: number;
  categorias: string[];
  riscos_alto_impacto: number;
  riscos_medio_impacto: number;
  riscos_baixo_impacto: number;
  impacto_score: number;
}

export const useCausesData = () => {
  const [causes, setCauses] = useState<RiskCause[]>([]);
  const [commonCauses, setCommonCauses] = useState<CommonCauseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCauses = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos_causas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCauses(data || []);
    } catch (error) {
      console.error('Error fetching causes:', error);
    }
  };

  const fetchCommonCausesAnalysis = async () => {
    try {
      const { data, error } = await supabase.rpc('analyze_common_causes');
      
      if (error) throw error;
      setCommonCauses(data || []);
    } catch (error) {
      console.error('Error fetching common causes analysis:', error);
    }
  };

  const createCause = async (causeData: Omit<RiskCause, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      const { data, error } = await supabase
        .from('riscos_causas')
        .insert([causeData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCauses();
      return { data };
    } catch (error) {
      console.error('Error creating cause:', error);
      return { error };
    }
  };

  const updateCause = async (id: string, updates: Partial<Omit<RiskCause, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('riscos_causas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCauses();
      return { data };
    } catch (error) {
      console.error('Error updating cause:', error);
      return { error };
    }
  };

  const deleteCause = async (id: string) => {
    try {
      const { error } = await supabase
        .from('riscos_causas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchCauses();
      return { success: true };
    } catch (error) {
      console.error('Error deleting cause:', error);
      return { error };
    }
  };

  const getCausesForRisk = (riskId: string) => {
    return causes.filter(cause => cause.risco_id === riskId);
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchCauses(), fetchCommonCausesAnalysis()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  return {
    causes,
    commonCauses,
    loading,
    createCause,
    updateCause,
    deleteCause,
    getCausesForRisk,
    refreshData,
  };
};