import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const seedDemoData = async () => {
  try {
    console.log("🌱 Iniciando população de dados de demonstração...");

    // Buscar usuários existentes
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nome, role')
      .order('created_at')
      .limit(7);

    if (!profiles || profiles.length === 0) {
      toast.error("Nenhum usuário encontrado no sistema");
      return;
    }

    const adminUser = profiles.find(p => p.role === 'admin') || profiles[0];
    const gestores = profiles.filter(p => p.role === 'admin' || p.role === 'gestor').slice(0, 3);
    
    console.log(`✅ Encontrados ${profiles.length} usuários`);

    // 1. Criar projetos de demonstração
    console.log("📁 Criando projetos...");
    const { data: projetos, error: projetosError } = await supabase
      .from('projetos')
      .insert([
        {
          nome: 'Transformação Digital Corporativa',
          descricao: 'Modernização da infraestrutura tecnológica e processos digitais da organização',
          gestor_id: gestores[0]?.id,
          data_inicio: '2024-01-15',
          data_fim: '2025-12-31',
          status: 'Ativo'
        },
        {
          nome: 'Implantação Sistema ERP Integrado',
          descricao: 'Substituição de sistemas legados por solução ERP unificada',
          gestor_id: gestores[1]?.id || gestores[0]?.id,
          data_inicio: '2024-03-01',
          data_fim: '2025-06-30',
          status: 'Ativo'
        },
        {
          nome: 'Portal de Serviços ao Cidadão',
          descricao: 'Desenvolvimento de plataforma omnichannel para atendimento integrado',
          gestor_id: gestores[2]?.id || gestores[0]?.id,
          data_inicio: '2024-02-10',
          data_fim: '2024-11-30',
          status: 'Ativo'
        }
      ])
      .select();

    if (projetosError) {
      console.error("❌ Erro ao criar projetos:", projetosError);
      toast.error("Erro ao criar projetos: " + projetosError.message);
      return;
    }

    console.log(`✅ ${projetos.length} projetos criados`);

    // 2. Criar riscos realistas
    console.log("⚠️ Criando riscos...");
    
    const hoje = new Date();
    const riscosData = [
      {
        codigo: 'R-TEC-001',
        categoria: 'Tecnologia' as const,
        descricao_risco: 'Incompatibilidade entre sistemas legados e nova arquitetura',
        causas: 'Falta de documentação técnica dos sistemas antigos; APIs não padronizadas; Tecnologias descontinuadas',
        consequencias: 'Atraso no cronograma de 3-6 meses; Necessidade de desenvolvimento de camadas de integração não previstas; Aumento de 30% no orçamento',
        probabilidade: 'Alta' as const,
        impacto: 'Alto' as const,
        nivel_risco: 'Alto' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Realizar mapeamento detalhado de todas as integrações; Criar POCs das integrações críticas; Contratar especialistas em sistemas legados; Estabelecer arquitetura de microserviços com camada de abstração',
        acoes_contingencia: 'Manter sistemas legados operacionais em paralelo por 12 meses; Desenvolver adaptadores customizados; Alocar budget de contingência de 20%',
        status: 'Em Análise' as const,
        responsavel_id: gestores[0]?.id,
        projeto_id: projetos[0].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Risco crítico identificado na fase de análise técnica'
      },
      {
        codigo: 'R-OPE-002',
        categoria: 'Operacional' as const,
        descricao_risco: 'Rotatividade alta de profissionais especializados na equipe',
        causas: 'Mercado aquecido para TI; Salários não competitivos; Falta de plano de carreira; Sobrecarga de trabalho',
        consequencias: 'Perda de conhecimento crítico do projeto; Retrabalho em módulos já desenvolvidos; Atraso de 2-4 meses no cronograma; Queda na qualidade das entregas',
        probabilidade: 'Muito Alta' as const,
        impacto: 'Alto' as const,
        nivel_risco: 'Crítico' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Implementar programa de retenção de talentos; Oferecer bonificação por permanência; Criar documentação técnica detalhada; Estabelecer pair programming obrigatório; Plano de sucessão para posições críticas',
        acoes_contingencia: 'Banco de talentos pré-aprovados para contratação emergencial; Parcerias com consultorias especializadas; Redistribuição de atividades',
        status: 'Em Andamento' as const,
        responsavel_id: gestores[1]?.id || gestores[0]?.id,
        projeto_id: projetos[0].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Já perdemos 2 desenvolvedores seniors no último trimestre'
      },
      {
        codigo: 'R-FIN-003',
        categoria: 'Financeiro' as const,
        descricao_risco: 'Estouro orçamentário devido a mudanças de escopo',
        causas: 'Requisitos iniciais mal definidos; Pressão de stakeholders por novas funcionalidades; Descoberta de complexidades não previstas; Mudanças regulatórias',
        consequencias: 'Necessidade de aprovação de orçamento adicional de 40%; Redução de escopo nas funcionalidades secundárias; Comprometimento da qualidade técnica; Possível cancelamento do projeto',
        probabilidade: 'Alta' as const,
        impacto: 'Muito Alto' as const,
        nivel_risco: 'Crítico' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Implementar gestão rigorosa de mudanças com comitê de aprovação; Criar baseline de escopo congelada; Estabelecer buffer de contingência de 15%; Reuniões quinzenais de controle orçamentário; Priorização MoSCoW',
        acoes_contingencia: 'Negociar prazo estendido em troca de manutenção de budget; Implementar entrega incremental com fases menores; Buscar fontes alternativas de financiamento',
        status: 'Em Monitoramento' as const,
        responsavel_id: profiles[3]?.id || gestores[0]?.id,
        projeto_id: projetos[1].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Budget atual já comprometido em 65% e temos apenas 40% do projeto executado'
      },
      {
        codigo: 'R-EST-004',
        categoria: 'Estratégico' as const,
        descricao_risco: 'Desalinhamento entre expectativas dos stakeholders e capacidade de entrega',
        causas: 'Comunicação deficiente com sponsors; Promessas comerciais irrealistas; Falta de gestão de expectativas; Múltiplos interesses conflitantes',
        consequencias: 'Insatisfação dos patrocinadores; Cancelamento ou suspensão do projeto; Desgaste da imagem do PMO; Conflitos organizacionais; Desmotivação da equipe',
        probabilidade: 'Média' as const,
        impacto: 'Muito Alto' as const,
        nivel_risco: 'Alto' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Estabelecer comitê diretivo com reuniões mensais; Criar dashboard executivo com KPIs realistas; Implementar comunicação proativa semanal; Workshops de alinhamento trimestral; Documentar expectativas formalmente',
        acoes_contingencia: 'Mediação com alta direção; Redefinição de escopo com aprovação formal; Substituição de sponsor se necessário; Pausa técnica para realinhamento estratégico',
        status: 'Em Análise' as const,
        responsavel_id: gestores[2]?.id || gestores[0]?.id,
        projeto_id: projetos[2].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Detectado gap significativo na última reunião de steering committee'
      },
      {
        codigo: 'R-TEC-005',
        categoria: 'Tecnologia' as const,
        descricao_risco: 'Falhas de segurança e vulnerabilidades no sistema',
        causas: 'Pressão por entregas rápidas negligenciando segurança; Falta de especialistas em segurança na equipe; Bibliotecas de terceiros desatualizadas; Ausência de testes de penetração',
        consequencias: 'Vazamento de dados sensíveis; Multas por não conformidade com LGPD; Comprometimento da operação; Perda de credibilidade institucional; Processos judiciais',
        probabilidade: 'Média' as const,
        impacto: 'Muito Alto' as const,
        nivel_risco: 'Alto' as const,
        estrategia: 'Evitar' as const,
        acoes_mitigacao: 'Incluir especialista de segurança na equipe; Implementar Security by Design; Realizar code review focado em segurança; Automatizar testes de vulnerabilidade (SAST/DAST); Auditorias de segurança trimestrais; Treinamento OWASP Top 10',
        acoes_contingencia: 'Contratar empresa para remediação emergencial; Plano de resposta a incidentes; Seguro cyber; Comunicação de crise pré-elaborada',
        status: 'Em Andamento' as const,
        responsavel_id: profiles[4]?.id || gestores[0]?.id,
        projeto_id: projetos[2].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Último pentest identificou 8 vulnerabilidades médias'
      },
      {
        codigo: 'R-OPE-006',
        categoria: 'Operacional' as const,
        descricao_risco: 'Dependência crítica de fornecedor único',
        causas: 'Tecnologia proprietária específica; Contrato de exclusividade; Expertise técnica concentrada; Falta de alternativas no mercado',
        consequencias: 'Vulnerabilidade a aumentos de preço arbitrários; Risco de descontinuidade do serviço; Impossibilidade de migração rápida; Perda de poder de negociação; Lock-in tecnológico',
        probabilidade: 'Baixa' as const,
        impacto: 'Alto' as const,
        nivel_risco: 'Médio' as const,
        estrategia: 'Transferir' as const,
        acoes_mitigacao: 'Avaliar alternativas de mercado; Desenvolver POC com tecnologia alternativa; Negociar cláusulas de saída no contrato; Manter documentação detalhada; Estabelecer SLA rígido com penalidades',
        acoes_contingencia: 'Ter fornecedor backup pré-qualificado; Desenvolver capacidade interna para funcionalidades críticas; Plano de migração emergencial documentado',
        status: 'Identificado' as const,
        responsavel_id: profiles[5]?.id || gestores[0]?.id,
        projeto_id: projetos[1].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Fornecedor atual tem 100% dos módulos de RH e Financeiro'
      },
      {
        codigo: 'R-LEG-007',
        categoria: 'Regulatório' as const,
        descricao_risco: 'Não conformidade com LGPD e regulamentações de dados',
        causas: 'Requisitos legais não mapeados na fase de design; Ausência de DPO; Processos de consentimento inadequados; Falta de políticas de privacidade',
        consequencias: 'Multas de até 2% do faturamento (máx 50 milhões); Processos administrativos; Interdição do sistema; Danos reputacionais severos; Responsabilização pessoal de gestores',
        probabilidade: 'Média' as const,
        impacto: 'Muito Alto' as const,
        nivel_risco: 'Alto' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Contratar consultoria jurídica especializada em LGPD; Nomear DPO certificado; Implementar Privacy by Design; Realizar DPIA; Criar políticas de retenção e descarte; Implementar controles de acesso granulares',
        acoes_contingencia: 'Suspender processamento de dados pessoais até adequação; Notificação proativa à ANPD; Termo de ajustamento de conduta; Seguro de responsabilidade civil',
        status: 'Em Análise' as const,
        responsavel_id: gestores[1]?.id || gestores[0]?.id,
        projeto_id: projetos[2].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Portal processará dados pessoais sensíveis de milhares de cidadãos'
      },
      {
        codigo: 'R-OPE-008',
        categoria: 'Operacional' as const,
        descricao_risco: 'Resistência organizacional à mudança',
        causas: 'Cultura organizacional conservadora; Falta de comunicação dos benefícios; Medo de perda de emprego; Treinamento inadequado; Lideranças não engajadas',
        consequencias: 'Baixa adesão dos usuários finais; Sabotagem velada do projeto; Retorno aos processos antigos; Desperdício de investimento; Falha na realização de benefícios esperados',
        probabilidade: 'Alta' as const,
        impacto: 'Alto' as const,
        nivel_risco: 'Alto' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Plano de gestão de mudança robusto; Identificar e engajar champions; Programa de comunicação contínua multi-canal; Treinamentos práticos hands-on; Quick wins para demonstrar valor; Suporte pós go-live intensivo',
        acoes_contingencia: 'Fase piloto estendida em área menos resistente; Rollback parcial se necessário; Incentivos para early adopters; Coaching individual para resistentes',
        status: 'Identificado' as const,
        responsavel_id: gestores[2]?.id || gestores[0]?.id,
        projeto_id: projetos[1].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Pesquisa de clima indicou 45% de resistência à mudança proposta'
      },
      {
        codigo: 'R-TEC-009',
        categoria: 'Tecnologia' as const,
        descricao_risco: 'Desempenho inadequado da solução em ambiente de produção',
        causas: 'Testes de carga insuficientes; Ambiente de homologação não replica produção; Crescimento de volume subestimado; Arquitetura não escalável',
        consequencias: 'Lentidão inaceitável para usuários (>5s de resposta); Indisponibilidade em horários de pico; Perda de transações; Frustração dos usuários; Necessidade de refatoração arquitetural',
        probabilidade: 'Média' as const,
        impacto: 'Alto' as const,
        nivel_risco: 'Médio' as const,
        estrategia: 'Mitigar' as const,
        acoes_mitigacao: 'Realizar testes de carga rigorosos com volume 3x superior ao previsto; Implementar monitoramento proativo (APM); Otimizar queries e índices de banco; Implementar cache em múltiplas camadas; Arquitetura cloud-native com auto-scaling',
        acoes_contingencia: 'Infraestrutura sobressalente pronta para ativação; Otimização emergencial de código crítico; Limitação temporária de funcionalidades não essenciais; Escala vertical emergencial',
        status: 'Monitorado',
        responsavel_id: profiles[4]?.id || gestores[0]?.id,
        projeto_id: projetos[2].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Últimos testes mostraram degradação com 1000 usuários simultâneos'
      },
      {
        codigo: 'R-EST-010',
        categoria: 'Estratégico' as const,
        descricao_risco: 'Mudança de prioridades estratégicas da organização',
        causas: 'Nova gestão com diferentes prioridades; Crise econômica; Mudanças no cenário político; Surgimento de oportunidades mais urgentes',
        consequencias: 'Cancelamento súbito do projeto; Redução drástica de recursos; Perda de patrocínio executivo; Desmotivação da equipe; Desperdício de investimentos já realizados',
        probabilidade: 'Baixa' as const,
        impacto: 'Muito Alto' as const,
        nivel_risco: 'Médio' as const,
        estrategia: 'Aceitar' as const,
        acoes_mitigacao: 'Alinhar projeto com objetivos estratégicos documentados; Demonstrar valor e ROI continuamente; Manter flexibilidade para adaptação; Entregas incrementais para gerar valor rápido; Networking com stakeholders chave',
        acoes_contingencia: 'Plano de encerramento organizado do projeto; Documentação completa do trabalho realizado; Preservação de ativos reutilizáveis; Realocar equipe para outros projetos',
        status: 'Identificado',
        responsavel_id: gestores[0]?.id,
        projeto_id: projetos[0].id,
        criado_por: adminUser.id,
        data_identificacao: new Date(hoje.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: 'Monitorar continuamente alinhamento com planejamento estratégico'
      }
    ];

    const { data: riscos, error: riscosError } = await supabase
      .from('riscos')
      .insert(riscosData)
      .select();

    if (riscosError) {
      console.error("❌ Erro ao criar riscos:", riscosError);
      toast.error("Erro ao criar riscos: " + riscosError.message);
      return;
    }

    console.log(`✅ ${riscos.length} riscos criados`);

    // 3. Criar causas estruturadas para alguns riscos
    console.log("🔍 Criando causas estruturadas...");
    
    const causasData = [
      // Causas para R-TEC-001
      { risco_id: riscos[0].id, descricao: 'Documentação técnica dos sistemas legados inexistente ou desatualizada', categoria: 'Técnica' },
      { risco_id: riscos[0].id, descricao: 'APIs dos sistemas antigos não seguem padrões REST/SOAP', categoria: 'Técnica' },
      { risco_id: riscos[0].id, descricao: 'Tecnologias descontinuadas sem suporte do fabricante', categoria: 'Técnica' },
      
      // Causas para R-OPE-002
      { risco_id: riscos[1].id, descricao: 'Salários oferecidos 20-30% abaixo da média de mercado', categoria: 'Organizacional' },
      { risco_id: riscos[1].id, descricao: 'Ausência de plano de carreira estruturado para equipe técnica', categoria: 'Organizacional' },
      { risco_id: riscos[1].id, descricao: 'Carga de trabalho excedendo 50h semanais consistentemente', categoria: 'Organizacional' },
      
      // Causas para R-FIN-003
      { risco_id: riscos[2].id, descricao: 'Levantamento de requisitos realizado de forma superficial', categoria: 'Processo' },
      { risco_id: riscos[2].id, descricao: 'Stakeholders solicitando features fora do escopo original', categoria: 'Partes Interessadas' },
      { risco_id: riscos[2].id, descricao: 'Complexidades técnicas descobertas durante desenvolvimento', categoria: 'Técnica' },
      
      // Causas para R-EST-004
      { risco_id: riscos[3].id, descricao: 'Falta de reuniões regulares com patrocinadores do projeto', categoria: 'Comunicação' },
      { risco_id: riscos[3].id, descricao: 'Promessas irrealistas feitas pela área comercial', categoria: 'Comercial' },
      { risco_id: riscos[3].id, descricao: 'Múltiplas áreas de negócio com objetivos conflitantes', categoria: 'Partes Interessadas' },
      
      // Causas para R-TEC-005
      { risco_id: riscos[4].id, descricao: 'Pressão por entregas rápidas sacrificando qualidade de código', categoria: 'Processo' },
      { risco_id: riscos[4].id, descricao: 'Ausência de especialista em segurança na equipe do projeto', categoria: 'Recursos' },
      { risco_id: riscos[4].id, descricao: 'Bibliotecas npm/pip com vulnerabilidades conhecidas', categoria: 'Técnica' }
    ];

    const { error: causasError } = await supabase
      .from('riscos_causas')
      .insert(causasData);

    if (causasError) {
      console.error("❌ Erro ao criar causas:", causasError);
      toast.error("Erro ao criar causas: " + causasError.message);
      return;
    }

    console.log(`✅ ${causasData.length} causas estruturadas criadas`);

    toast.success(`✅ Dados de demonstração criados com sucesso!\n${projetos.length} projetos, ${riscos.length} riscos e ${causasData.length} causas`);
    
    console.log("🎉 População de dados concluída com sucesso!");
    console.log(`📊 Resumo: ${projetos.length} projetos, ${riscos.length} riscos, ${causasData.length} causas`);
    
    return {
      success: true,
      projetos: projetos.length,
      riscos: riscos.length,
      causas: causasData.length
    };

  } catch (error: any) {
    console.error("❌ Erro ao popular dados:", error);
    toast.error("Erro ao criar dados de demonstração: " + error.message);
    return { success: false, error: error.message };
  }
};
