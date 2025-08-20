import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCausesData } from './useCausesData';
import { useSupabaseRiskData } from './useSupabaseRiskData';

interface ConsistencyIssue {
  type: 'orphaned_cause' | 'missing_sync' | 'duplicate_description' | 'invalid_category';
  severity: 'low' | 'medium' | 'high';
  message: string;
  causeId?: string;
  riskId?: string;
  action?: string;
}

export const useCauseConsistency = () => {
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const { causes, refreshData } = useCausesData();
  const { risks } = useSupabaseRiskData();

  const validateConsistency = useCallback(async (showProgress = true) => {
    if (showProgress) setIsValidating(true);
    const foundIssues: ConsistencyIssue[] = [];

    try {
      console.log('🔍 [useCauseConsistency] Starting consistency validation...');

      // 1. Verificar causas órfãs (causas sem risco correspondente)
      const riskIds = new Set(risks.map(r => r.id));
      const orphanedCauses = causes.filter(cause => !riskIds.has(cause.risco_id));
      
      orphanedCauses.forEach(cause => {
        foundIssues.push({
          type: 'orphaned_cause',
          severity: 'high',
          message: `Causa "${cause.descricao}" referencia um risco inexistente (${cause.risco_id})`,
          causeId: cause.id,
          riskId: cause.risco_id,
          action: 'delete_cause'
        });
      });

      // 2. Verificar sincronização entre causas e campo causas
      for (const risk of risks) {
        const structuredCauses = causes.filter(c => c.risco_id === risk.id);
        const freeTextCauses = risk.causas || '';
        
        if (structuredCauses.length > 0 && !freeTextCauses.trim()) {
          foundIssues.push({
            type: 'missing_sync',
            severity: 'medium',
            message: `Risco "${risk.codigo}" tem causas estruturadas mas campo 'causas' está vazio`,
            riskId: risk.id,
            action: 'sync_causes'
          });
        }
      }

      // 3. Verificar duplicatas exatas por descrição
      const descriptionCounts = new Map<string, number>();
      causes.forEach(cause => {
        const desc = cause.descricao.trim().toLowerCase();
        descriptionCounts.set(desc, (descriptionCounts.get(desc) || 0) + 1);
      });

      descriptionCounts.forEach((count, description) => {
        if (count > 1) {
          foundIssues.push({
            type: 'duplicate_description',
            severity: 'low',
            message: `Descrição "${description}" aparece ${count} vezes - considere mesclar causas similares`,
            action: 'merge_duplicates'
          });
        }
      });

      // 4. Verificar categorias inválidas
      const validCategories = [
        'Tecnologia', 'Recursos Humanos', 'Financeiro', 'Operacional',
        'Compliance', 'Estratégico', 'Regulatório', 'Cronograma', 
        'Recursos', 'Técnico', 'Comunicação', 'Legal/Regulatório', 'Externo'
      ];
      
      causes.forEach(cause => {
        if (cause.categoria && !validCategories.includes(cause.categoria)) {
          foundIssues.push({
            type: 'invalid_category',
            severity: 'low',
            message: `Categoria "${cause.categoria}" não é padrão para causa "${cause.descricao}"`,
            causeId: cause.id,
            action: 'fix_category'
          });
        }
      });

      setIssues(foundIssues);
      setLastValidation(new Date());
      
      console.log(`✅ [useCauseConsistency] Validation complete. Found ${foundIssues.length} issues:`, {
        high: foundIssues.filter(i => i.severity === 'high').length,
        medium: foundIssues.filter(i => i.severity === 'medium').length,
        low: foundIssues.filter(i => i.severity === 'low').length
      });

    } catch (error) {
      console.error('❌ [useCauseConsistency] Error during validation:', error);
      foundIssues.push({
        type: 'orphaned_cause',
        severity: 'high',
        message: 'Erro ao validar consistência do sistema',
        action: 'retry'
      });
    } finally {
      if (showProgress) setIsValidating(false);
    }

    return foundIssues;
  }, [causes, risks]);

  const resolveIssue = useCallback(async (issue: ConsistencyIssue) => {
    console.log('🔧 [useCauseConsistency] Resolving issue:', issue);
    
    try {
      switch (issue.action) {
        case 'delete_cause':
          if (issue.causeId) {
            await supabase
              .from('riscos_causas')
              .delete()
              .eq('id', issue.causeId);
            console.log(`✅ Deleted orphaned cause ${issue.causeId}`);
          }
          break;
          
        case 'sync_causes':
          if (issue.riskId) {
            // Trigger manual sync by updating a cause (the trigger will handle sync)
            const riskCauses = causes.filter(c => c.risco_id === issue.riskId);
            if (riskCauses.length > 0) {
              await supabase
                .from('riscos_causas')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', riskCauses[0].id);
              console.log(`✅ Triggered sync for risk ${issue.riskId}`);
            }
          }
          break;
          
        default:
          console.log(`⚠️ No automatic resolution for action: ${issue.action}`);
      }
      
      // Refresh data and re-validate
      await refreshData(true);
      setTimeout(() => validateConsistency(false), 1000);
      
    } catch (error) {
      console.error('❌ Error resolving issue:', error);
      throw error;
    }
  }, [causes, refreshData, validateConsistency]);

  const resolveAllAutomaticIssues = useCallback(async () => {
    setIsValidating(true);
    const automaticIssues = issues.filter(issue => 
      ['delete_cause', 'sync_causes'].includes(issue.action || '')
    );
    
    console.log(`🔧 [useCauseConsistency] Resolving ${automaticIssues.length} automatic issues...`);
    
    try {
      for (const issue of automaticIssues) {
        await resolveIssue(issue);
      }
      console.log('✅ All automatic issues resolved');
    } catch (error) {
      console.error('❌ Error resolving automatic issues:', error);
    } finally {
      setIsValidating(false);
    }
  }, [issues, resolveIssue]);

  // Auto-validate when data changes
  useEffect(() => {
    if (causes.length > 0 && risks.length > 0) {
      // Delay validation to avoid excessive calls
      const timer = setTimeout(() => {
        validateConsistency(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [causes.length, risks.length, validateConsistency]);

  return {
    issues,
    isValidating,
    lastValidation,
    validateConsistency,
    resolveIssue,
    resolveAllAutomaticIssues,
    hasHighSeverityIssues: issues.some(i => i.severity === 'high'),
    hasMediumSeverityIssues: issues.some(i => i.severity === 'medium'),
    totalIssues: issues.length
  };
};