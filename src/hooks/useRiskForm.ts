
import { useState } from 'react';
import { toast } from 'sonner';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';
import { calculateRiskLevel } from '@/utils/riskCalculations';

export interface RiskFormData {
  codigo: string;
  categoria: Database['public']['Enums']['risk_category'] | '';
  descricao_risco: string;
  causas: string;
  consequencias: string;
  probabilidade: Database['public']['Enums']['risk_probability'] | '';
  impacto: Database['public']['Enums']['risk_impact'] | '';
  estrategia: Database['public']['Enums']['risk_strategy'] | '';
  acoes_mitigacao: string;
  acoes_contingencia: string;
  responsavel_id: string;
  prazo: string;
  status: Database['public']['Enums']['risk_status'];
  observacoes: string;
  projeto_id: string;
}

export const useRiskForm = (onSuccess: () => void) => {
  const { createRisk } = useSupabaseRiskData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<RiskFormData>({
    codigo: '',
    categoria: '',
    descricao_risco: '',
    causas: '',
    consequencias: '',
    probabilidade: '',
    impacto: '',
    estrategia: '',
    acoes_mitigacao: '',
    acoes_contingencia: '',
    responsavel_id: '',
    prazo: '',
    status: 'Identificado' as Database['public']['Enums']['risk_status'],
    observacoes: '',
    projeto_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      categoria: '',
      descricao_risco: '',
      causas: '',
      consequencias: '',
      probabilidade: '',
      impacto: '',
      estrategia: '',
      acoes_mitigacao: '',
      acoes_contingencia: '',
      responsavel_id: '',
      prazo: '',
      status: 'Identificado' as Database['public']['Enums']['risk_status'],
      observacoes: '',
      projeto_id: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para criar um risco');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validação básica
      if (!formData.codigo || !formData.descricao_risco || !formData.probabilidade || !formData.impacto || !formData.categoria || !formData.estrategia) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      // Calcular nível de risco usando a função utilitária
      const nivel_risco = calculateRiskLevel(formData.probabilidade, formData.impacto);
      
      const riskData = {
        codigo: formData.codigo,
        categoria: formData.categoria as Database['public']['Enums']['risk_category'],
        descricao_risco: formData.descricao_risco,
        causas: formData.causas || null,
        consequencias: formData.consequencias || null,
        probabilidade: formData.probabilidade as Database['public']['Enums']['risk_probability'],
        impacto: formData.impacto as Database['public']['Enums']['risk_impact'],
        nivel_risco,
        estrategia: formData.estrategia as Database['public']['Enums']['risk_strategy'],
        acoes_mitigacao: formData.acoes_mitigacao || null,
        acoes_contingencia: formData.acoes_contingencia || null,
        responsavel_id: formData.responsavel_id || null,
        prazo: formData.prazo || null,
        status: formData.status,
        observacoes: formData.observacoes || null,
        projeto_id: formData.projeto_id || null,
        data_identificacao: new Date().toISOString().split('T')[0]
      };

      console.log('Salvando risco:', riskData);
      
      const result = await createRisk(riskData);
      
      if (!result.error) {
        resetForm();
        onSuccess();
      }
      
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      toast.error('Erro ao salvar o risco. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  };
};
