import { useState, useEffect, useCallback } from 'react';
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
  criticidade_score: number;
  tendencia_score: number;
  complexidade_score: number;
  score_final: number;
  confiabilidade_score: number;
  riscos_afetados: string[];
}

export const useCausesData = () => {
  const [causes, setCauses] = useState<RiskCause[]>([]);
  const [commonCauses, setCommonCauses] = useState<CommonCauseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [causesCache, setCausesCache] = useState<Map<string, RiskCause[]>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { user } = useAuth();

  const fetchCauses = async (forceRefresh = false) => {
    const now = Date.now();
    // Cache por 30 segundos para evitar requests desnecessários
    if (!forceRefresh && now - lastFetchTime < 30000 && causes.length > 0) {
      console.log('🔄 [useCausesData] Using cached causes data');
      return;
    }

    try {
      console.log('🔍 [useCausesData] Fetching causes from database...');
      const { data, error } = await supabase
        .from('riscos_causas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const causesData = data || [];
      setCauses(causesData);
      setLastFetchTime(now);
      
      // Atualizar cache por risco
      const newCache = new Map<string, RiskCause[]>();
      causesData.forEach(cause => {
        if (!newCache.has(cause.risco_id)) {
          newCache.set(cause.risco_id, []);
        }
        newCache.get(cause.risco_id)?.push(cause);
      });
      setCausesCache(newCache);
      
      console.log(`✅ [useCausesData] Loaded ${causesData.length} causes for ${newCache.size} risks`);
    } catch (error) {
      console.error('❌ [useCausesData] Error fetching causes:', error);
    }
  };

  const fetchCommonCausesAnalysis = async () => {
    try {
      console.log('🔍 [useCausesData] Fetching common causes analysis...');
      const { data, error } = await supabase.rpc('analyze_common_causes_enhanced');
      
      if (error) throw error;
      setCommonCauses(data || []);
      console.log(`✅ [useCausesData] Loaded ${data?.length || 0} common causes`);
    } catch (error) {
      console.error('❌ [useCausesData] Error fetching common causes analysis:', error);
    }
  };

  const createCause = async (causeData: Omit<RiskCause, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { error: 'Usuário não autenticado' };
    }

    try {
      console.log('🔄 [useCausesData] Creating cause:', causeData);
      const { data, error } = await supabase
        .from('riscos_causas')
        .insert([causeData])
        .select()
        .single();

      if (error) throw error;
      
      // Invalidar cache e recarregar
      invalidateRiskCache(causeData.risco_id);
      await fetchCauses(true);
      console.log('✅ [useCausesData] Cause created successfully');
      return { data };
    } catch (error) {
      console.error('❌ [useCausesData] Error creating cause:', error);
      return { error };
    }
  };

  const updateCause = async (id: string, updates: Partial<Omit<RiskCause, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      console.log('🔄 [useCausesData] Updating cause:', id, updates);
      const { data, error } = await supabase
        .from('riscos_causas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Invalidar cache e recarregar
      if (data) {
        invalidateRiskCache(data.risco_id);
      }
      await fetchCauses(true);
      console.log('✅ [useCausesData] Cause updated successfully');
      return { data };
    } catch (error) {
      console.error('❌ [useCausesData] Error updating cause:', error);
      return { error };
    }
  };

  const deleteCause = async (id: string) => {
    try {
      console.log('🔄 [useCausesData] Deleting cause:', id);
      
      // Primeiro buscar a causa para saber qual risco cache invalidar
      const causeToDelete = causes.find(c => c.id === id);
      
      const { error } = await supabase
        .from('riscos_causas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Invalidar cache e recarregar
      if (causeToDelete) {
        invalidateRiskCache(causeToDelete.risco_id);
      }
      await fetchCauses(true);
      console.log('✅ [useCausesData] Cause deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [useCausesData] Error deleting cause:', error);
      return { error };
    }
  };

  const getCausesForRisk = useCallback((riskId: string): RiskCause[] => {
    if (!riskId) {
      console.warn('⚠️ [useCausesData] getCausesForRisk called without riskId');
      return [];
    }

    // Tentar usar cache primeiro
    const cachedCauses = causesCache.get(riskId);
    if (cachedCauses) {
      console.log(`🎯 [useCausesData] Using cached causes for risk ${riskId}: ${cachedCauses.length} causes`);
      return cachedCauses;
    }

    // Fallback para filtro direto
    const filteredCauses = causes.filter(cause => cause.risco_id === riskId);
    console.log(`🔍 [useCausesData] Filtered causes for risk ${riskId}: ${filteredCauses.length} causes`);
    
    // Validar se as causas realmente pertencem ao risco
    const validCauses = filteredCauses.filter(cause => {
      if (cause.risco_id !== riskId) {
        console.error(`❌ [useCausesData] Invalid cause found! Cause ${cause.id} belongs to risk ${cause.risco_id}, not ${riskId}`);
        return false;
      }
      return true;
    });

    if (validCauses.length !== filteredCauses.length) {
      console.warn(`⚠️ [useCausesData] Data inconsistency detected! ${filteredCauses.length - validCauses.length} invalid causes filtered out`);
    }

    return validCauses;
  }, [causes, causesCache]);

  const refreshData = async (forceRefresh = false) => {
    console.log('🔄 [useCausesData] Refreshing data...', { forceRefresh });
    setLoading(true);
    await Promise.all([
      fetchCauses(forceRefresh), 
      fetchCommonCausesAnalysis()
    ]);
    setLoading(false);
  };

  const invalidateRiskCache = (riskId: string) => {
    console.log(`🗑️ [useCausesData] Invalidating cache for risk ${riskId}`);
    setCausesCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(riskId);
      return newCache;
    });
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Limpar dados quando não autenticado
      setCauses([]);
      setCommonCauses([]);
      setCausesCache(new Map());
      setLastFetchTime(0);
      setLoading(false);
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
    invalidateRiskCache,
    isDataFresh: Date.now() - lastFetchTime < 30000,
  };
};