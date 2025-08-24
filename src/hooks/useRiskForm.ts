
import { useState } from 'react';
import { toast } from 'sonner';
import { useSupabaseRiskData } from '@/hooks/useSupabaseRiskData';
import { useCausesData } from '@/hooks/useCausesData';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';
import { calculateRiskLevel } from '@/utils/riskCalculations';
import { generateRiskCode } from '@/utils/riskCodeGenerator';
import { AIRiskResponse } from '@/types/aiRiskResponse';

interface Cause {
  id?: string;
  descricao: string;
  categoria: string | null;
}

export interface RiskFormData {
  codigo: string;
  categoria: Database['public']['Enums']['risk_category'] | '';
  descricao_risco: string;
  causas: string;
  causas_estruturadas?: Cause[];
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
  const { createRisk, projects } = useSupabaseRiskData();
  const { createCause } = useCausesData();
  const { user, profile } = useAuth();
  
  const [formData, setFormData] = useState<RiskFormData>({
    codigo: '',
    categoria: '',
    descricao_risco: '',
    causas: '',
    causas_estruturadas: [],
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

  const handleChange = async (field: string, value: string | Cause[]) => {
    // Não aceitar valores vazios para campos obrigatórios do select
    if ((field === 'categoria' || field === 'probabilidade' || field === 'impacto' || field === 'estrategia') && value === '') {
      return;
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Se não for edição explícita do status e não for um risco da IA, manter status como "Identificado"
      if (field !== 'status' && prev.status !== 'IA') {
        newData.status = 'Identificado';
      }
      
      return newData;
    });

    // Auto-generate risk code when project is selected
    if (field === 'projeto_id' && typeof value === 'string' && value) {
      const selectedProject = projects.find(p => p.id === value);
      if (selectedProject) {
        try {
          const newCode = await generateRiskCode(value, selectedProject.nome);
          if (newCode) {
            setFormData(prev => ({
              ...prev,
              codigo: newCode
            }));
          }
        } catch (error) {
          console.error('Error generating risk code:', error);
          toast.error('Erro ao gerar código do risco automaticamente');
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      categoria: '',
      descricao_risco: '',
      causas: '',
      causas_estruturadas: [],
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

    // Verificar se o perfil do usuário tem permissão
    if (!profile) {
      toast.error('Perfil de usuário não encontrado. Faça logout e login novamente.');
      return;
    }

    console.log('User profile:', profile);
    console.log('User role:', profile.role);

    // Verificar se o usuário tem uma role adequada
    const allowedRoles = ['admin', 'gestor', 'analista'];
    if (!allowedRoles.includes(profile.role)) {
      toast.error(`Você não tem permissão para criar riscos. Sua role atual é: ${profile.role}. Roles permitidas: ${allowedRoles.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Garantir que status não seja vazio - definir como "Identificado" se não for especificado
      if (!formData.status || formData.status.trim() === '') {
        setFormData(prev => ({ ...prev, status: 'Identificado' as Database['public']['Enums']['risk_status'] }));
        toast.error('Status é obrigatório. Definido como "Identificado".');
        setIsSubmitting(false);
        return;
      }

      // Validação básica
      if (!formData.codigo || !formData.descricao_risco || !formData.probabilidade || !formData.impacto || !formData.categoria || !formData.estrategia) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        setIsSubmitting(false);
        return;
      }

      // Calcular nível de risco usando a função utilitária
      const nivel_risco = calculateRiskLevel(formData.probabilidade, formData.impacto);
      
      // Create legacy causas string for backward compatibility
      const causasString = formData.causas_estruturadas && formData.causas_estruturadas.length > 0
        ? formData.causas_estruturadas.map(c => c.descricao).join('; ')
        : formData.causas || null;
      
      const riskData = {
        codigo: formData.codigo,
        categoria: formData.categoria as Database['public']['Enums']['risk_category'],
        descricao_risco: formData.descricao_risco,
        causas: causasString,
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
        data_identificacao: new Date().toISOString().split('T')[0],
        criado_por: user.id // Garantir que o criado_por seja definido
      };

      console.log('Dados do risco a serem salvos:', riskData);
      
      const result = await createRisk(riskData);
      
      if (!result.error && result.data) {
        // Save individual causes if any
        if (formData.causas_estruturadas && formData.causas_estruturadas.length > 0) {
          for (const causa of formData.causas_estruturadas) {
            if (causa.descricao.trim()) {
              await createCause({
                risco_id: result.data.id,
                descricao: causa.descricao,
                categoria: causa.categoria,
              });
            }
          }
        }
        
        resetForm();
        onSuccess();
      }
      
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      if (error instanceof Error) {
        if (error.message.includes('row-level security policy')) {
          toast.error(`Erro de permissão: Sua role (${profile.role}) não tem permissão para criar riscos. Entre em contato com o administrador.`);
        } else {
          toast.error('Erro ao salvar o risco: ' + error.message);
        }
      } else {
        toast.error('Erro inesperado ao salvar o risco.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCode = async () => {
    if (!formData.projeto_id) {
      toast.error('Selecione um projeto primeiro para gerar o código');
      return;
    }

    const selectedProject = projects.find(p => p.id === formData.projeto_id);
    if (selectedProject) {
      try {
        const newCode = await generateRiskCode(formData.projeto_id, selectedProject.nome);
        if (newCode) {
          setFormData(prev => ({
            ...prev,
            codigo: newCode
          }));
          toast.success('Código gerado automaticamente');
        }
      } catch (error) {
        console.error('Error generating risk code:', error);
        toast.error('Erro ao gerar código do risco');
      }
    }
  };

  const populateFromAI = (aiData: AIRiskResponse) => {
    // Processar causas da string para causas estruturadas
    let causasEstruturadas: Cause[] = [];
    
    if (aiData.causas && aiData.causas.trim()) {
      console.log('Processando causas da IA:', aiData.causas);
      
      // Dividir a string de causas por separadores comuns
      const causasTexto = aiData.causas
        .split(/[;,\n]|\d+\.\s*/) // Separar por ponto e vírgula, vírgula, quebra de linha ou números seguidos de ponto
        .map(causa => causa.trim())
        .filter(causa => causa.length > 0);
      
      // Converter cada causa em um objeto Cause
      causasEstruturadas = causasTexto.map((descricao, index) => ({
        id: `ai-${Date.now()}-${index}`,
        descricao: descricao,
        categoria: null
      }));
      
      console.log('Causas estruturadas processadas:', causasEstruturadas);
    }

    // Processar recomendações da IA para o campo observações
    let observacoesCompletas = aiData.observacoes || '';
    if (aiData.recommendations && aiData.recommendations.length > 0) {
      const recomendacoes = aiData.recommendations.join('; ');
      observacoesCompletas = observacoesCompletas 
        ? `${observacoesCompletas}\n\nRecomendações: ${recomendacoes}`
        : `Recomendações: ${recomendacoes}`;
    }

    setFormData(prev => ({
      codigo: aiData.codigo || '',
      categoria: aiData.categoria as Database['public']['Enums']['risk_category'] || '',
      descricao_risco: aiData.descricao_risco || '',
      causas: aiData.causas || '',
      causas_estruturadas: causasEstruturadas,
      consequencias: aiData.consequencias || '',
      probabilidade: aiData.probabilidade as Database['public']['Enums']['risk_probability'] || '',
      impacto: aiData.impacto as Database['public']['Enums']['risk_impact'] || '',
      estrategia: aiData.estrategia as Database['public']['Enums']['risk_strategy'] || '',
      acoes_mitigacao: aiData.acoes_mitigacao || '',
      acoes_contingencia: aiData.acoes_contingencia || '',
      observacoes: observacoesCompletas,
      status: 'IA' as Database['public']['Enums']['risk_status'],
      projeto_id: prev.projeto_id,
      responsavel_id: prev.responsavel_id,
      prazo: prev.prazo,
    }));
    
    const causasCount = causasEstruturadas.length;
    toast.success(`Dados preenchidos pela IA automaticamente${causasCount > 0 ? ` (${causasCount} causas processadas)` : ''}`);
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    generateCode,
    populateFromAI
  };
};
