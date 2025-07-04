
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Risk {
  id: string;
  categoria: string;
  nivelRisco: string;
  status: string;
  projeto: string;
  dataIdentificacao: string;
  responsavel: string;
  probabilidade: string;
  impacto: string;
}

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  project?: string;
  status?: string;
  responsible?: string;
}

export const useReportData = (risks: Risk[], filters: ReportFilters = {}) => {
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      // Filtro por data
      if (filters.startDate && filters.endDate) {
        const riskDate = new Date(risk.dataIdentificacao);
        const dateInterval = { start: filters.startDate, end: filters.endDate };
        if (!isWithinInterval(riskDate, dateInterval)) return false;
      }

      // Filtro por categoria
      if (filters.category && filters.category !== 'all' && risk.categoria !== filters.category) {
        return false;
      }

      // Filtro por projeto
      if (filters.project && filters.project !== 'all' && risk.projeto !== filters.project) {
        return false;
      }

      // Filtro por status
      if (filters.status && filters.status !== 'all' && risk.status !== filters.status) {
        return false;
      }

      // Filtro por responsável
      if (filters.responsible && filters.responsible !== 'all' && risk.responsavel !== filters.responsible) {
        return false;
      }

      return true;
    });
  }, [risks, filters]);

  // Dados para gráfico de tendência mensal
  const monthlyTrends = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        year: format(date, 'yyyy'),
        fullDate: date
      };
    }).reverse();

    return last12Months.map(({ month, year, fullDate }) => {
      const monthStart = startOfMonth(fullDate);
      const monthEnd = endOfMonth(fullDate);
      
      const monthRisks = filteredRisks.filter(risk => {
        const riskDate = new Date(risk.dataIdentificacao);
        return isWithinInterval(riskDate, { start: monthStart, end: monthEnd });
      });

      return {
        month: `${month}/${year}`,
        alto: monthRisks.filter(r => r.nivelRisco === 'Alto' || r.nivelRisco === 'Crítico').length,
        medio: monthRisks.filter(r => r.nivelRisco === 'Médio').length,
        baixo: monthRisks.filter(r => r.nivelRisco === 'Baixo').length,
        total: monthRisks.length
      };
    });
  }, [filteredRisks]);

  // Distribuição por categoria
  const categoryDistribution = useMemo(() => {
    const categoryCount = filteredRisks.reduce((acc, risk) => {
      acc[risk.categoria] = {
        name: risk.categoria,
        total: (acc[risk.categoria]?.total || 0) + 1,
        alto: (acc[risk.categoria]?.alto || 0) + (risk.nivelRisco === 'Alto' || risk.nivelRisco === 'Crítico' ? 1 : 0),
        medio: (acc[risk.categoria]?.medio || 0) + (risk.nivelRisco === 'Médio' ? 1 : 0),
        baixo: (acc[risk.categoria]?.baixo || 0) + (risk.nivelRisco === 'Baixo' ? 1 : 0)
      };
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryCount);
  }, [filteredRisks]);

  // Distribuição por status
  const statusDistribution = useMemo(() => {
    const statusCount = filteredRisks.reduce((acc, risk) => {
      acc[risk.status] = (acc[risk.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / filteredRisks.length) * 100).toFixed(1)
    }));
  }, [filteredRisks]);

  // Distribuição por projeto
  const projectDistribution = useMemo(() => {
    const projectCount = filteredRisks.reduce((acc, risk) => {
      const project = risk.projeto || 'Sem Projeto';
      acc[project] = (acc[project] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(projectCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 projetos
  }, [filteredRisks]);

  // Métricas principais
  const metrics = useMemo(() => {
    const totalRisks = filteredRisks.length;
    const highRisks = filteredRisks.filter(r => r.nivelRisco === 'Alto' || r.nivelRisco === 'Crítico').length;
    const mediumRisks = filteredRisks.filter(r => r.nivelRisco === 'Médio').length;
    const lowRisks = filteredRisks.filter(r => r.nivelRisco === 'Baixo').length;
    const mitigatedRisks = filteredRisks.filter(r => r.status === 'Mitigado').length;
    const mitigationRate = totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 0;

    return {
      totalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      mitigatedRisks,
      mitigationRate: Math.round(mitigationRate)
    };
  }, [filteredRisks]);

  return {
    filteredRisks,
    monthlyTrends,
    categoryDistribution,
    statusDistribution,
    projectDistribution,
    metrics
  };
};
