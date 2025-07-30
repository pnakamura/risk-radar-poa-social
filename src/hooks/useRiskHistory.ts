import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type RiskHistory = Database['public']['Tables']['riscos_historico']['Row'] & {
  usuario?: { nome: string } | null;
};

type RiskVariablesHistory = Database['public']['Tables']['riscos_variaveis_historico']['Row'] & {
  usuario?: { nome: string } | null;
};

export const useRiskHistory = (riskId: string) => {
  const [riskHistory, setRiskHistory] = useState<RiskHistory[]>([]);
  const [variablesHistory, setVariablesHistory] = useState<RiskVariablesHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiskHistory = async () => {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('riscos_historico')
        .select(`
          *,
          usuario:profiles!riscos_historico_usuario_id_fkey(nome)
        `)
        .eq('risco_id', riskId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      const { data: variablesData, error: variablesError } = await supabase
        .from('riscos_variaveis_historico')
        .select(`
          *,
          usuario:profiles(nome)
        `)
        .eq('risco_id', riskId)
        .order('data_snapshot', { ascending: false });

      if (variablesError) throw variablesError;

      setRiskHistory(historyData as any || []);
      setVariablesHistory(variablesData as any || []);
    } catch (error) {
      console.error('Erro ao buscar histórico do risco:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (riskId) {
      fetchRiskHistory();
    }
  }, [riskId]);

  useEffect(() => {
    if (!riskId) return;

    const channel = supabase
      .channel('risk-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'riscos_historico',
          filter: `risco_id=eq.${riskId}`,
        },
        () => fetchRiskHistory()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'riscos_variaveis_historico',
          filter: `risco_id=eq.${riskId}`,
        },
        () => fetchRiskHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [riskId]);

  return {
    riskHistory,
    variablesHistory,
    loading,
    refetch: fetchRiskHistory,
  };
};