
import { useState, useEffect } from 'react';

interface Risk {
  id: string;
  codigo: string;
  categoria: string;
  descricaoRisco: string;
  causas: string;
  consequencias: string;
  probabilidade: string;
  impacto: string;
  nivelRisco: string;
  estrategia: string;
  acoesMitigacao: string;
  acoesContingencia: string;
  responsavel: string;
  prazo: string;
  status: string;
  observacoes: string;
  dataIdentificacao: string;
  projeto: string;
}

export const useRiskData = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  // Dados de exemplo baseados no contexto de gerenciamento de riscos
  const mockRisks: Risk[] = [
    {
      id: '1',
      codigo: 'RSK-001',
      categoria: 'Tecnologia',
      descricaoRisco: 'Falha no sistema de integração de dados',
      causas: 'Incompatibilidade entre sistemas legados e novas tecnologias',
      consequencias: 'Perda de dados, atraso no cronograma',
      probabilidade: 'Média',
      impacto: 'Alto',
      nivelRisco: 'Alto',
      estrategia: 'Mitigar',
      acoesMitigacao: 'Implementar testes de integração contínuos',
      acoesContingencia: 'Backup manual de dados críticos',
      responsavel: 'Equipe de TI',
      prazo: '2024-08-15',
      status: 'Em Monitoramento',
      observacoes: 'Requer atenção especial na fase de integração',
      dataIdentificacao: '2024-07-01',
      projeto: 'POA Digital'
    },
    {
      id: '2',
      codigo: 'RSK-002',
      categoria: 'Recursos Humanos',
      descricaoRisco: 'Rotatividade alta de pessoal especializado',
      causas: 'Mercado competitivo, baixa remuneração',
      consequencias: 'Perda de conhecimento, atraso em entregas',
      probabilidade: 'Alta',
      impacto: 'Médio',
      nivelRisco: 'Alto',
      estrategia: 'Mitigar',
      acoesMitigacao: 'Programa de retenção de talentos',
      acoesContingencia: 'Contratos de consultoria externa',
      responsavel: 'RH',
      prazo: '2024-09-30',
      status: 'Ativo',
      observacoes: 'Monitorar mensalmente',
      dataIdentificacao: '2024-06-15',
      projeto: 'POA Social'
    },
    {
      id: '3',
      codigo: 'RSK-003',
      categoria: 'Financeiro',
      descricaoRisco: 'Corte no orçamento do programa',
      causas: 'Mudanças políticas, crise econômica',
      consequencias: 'Redução de escopo, cancelamento de atividades',
      probabilidade: 'Baixa',
      impacto: 'Alto',
      nivelRisco: 'Médio',
      estrategia: 'Aceitar',
      acoesMitigacao: 'Diversificar fontes de financiamento',
      acoesContingencia: 'Plano de redução gradual de atividades',
      responsavel: 'Gestão Financeira',
      prazo: '2024-12-31',
      status: 'Monitorado',
      observacoes: 'Acompanhar cenário político',
      dataIdentificacao: '2024-07-10',
      projeto: 'POA+SOCIAL'
    },
    {
      id: '4',
      codigo: 'RSK-004',
      categoria: 'Operacional',
      descricaoRisco: 'Baixa adesão da população aos serviços digitais',
      causas: 'Falta de divulgação, resistência à mudança',
      consequencias: 'Não atingir metas de digitalização',
      probabilidade: 'Média',
      impacto: 'Médio',
      nivelRisco: 'Médio',
      estrategia: 'Mitigar',
      acoesMitigacao: 'Campanha de conscientização e treinamento',
      acoesContingencia: 'Manter canais tradicionais de atendimento',
      responsavel: 'Comunicação',
      prazo: '2024-10-15',
      status: 'Em Andamento',
      observacoes: 'Avaliar resultado das campanhas',
      dataIdentificacao: '2024-06-20',
      projeto: 'POA Digital'
    },
    {
      id: '5',
      codigo: 'RSK-005',
      categoria: 'Compliance',
      descricaoRisco: 'Não conformidade com LGPD',
      causas: 'Processos inadequados de tratamento de dados',
      consequencias: 'Multas, perda de credibilidade',
      probabilidade: 'Baixa',
      impacto: 'Alto',
      nivelRisco: 'Médio',
      estrategia: 'Mitigar',
      acoesMitigacao: 'Auditoria de conformidade LGPD',
      acoesContingencia: 'Plano de resposta a incidentes',
      responsavel: 'Jurídico',
      prazo: '2024-08-30',
      status: 'Planejado',
      observacoes: 'Prioridade alta para compliance',
      dataIdentificacao: '2024-07-05',
      projeto: 'POA+SOCIAL'
    }
  ];

  const fetchRisks = async () => {
    setLoading(true);
    try {
      // Simular chamada à API ou Google Sheets
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRisks(mockRisks);
    } catch (error) {
      console.error('Erro ao carregar dados de risco:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchRisks();
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  return { risks, loading, refreshData };
};
