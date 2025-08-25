import { HelpContent } from './HelpModal';

export const helpContent: Record<string, HelpContent> = {
  codigo: {
    field: 'codigo',
    title: 'Código do Risco',
    definition: 'Identificador único alfanumérico que permite rastrear e referenciar o risco de forma inequívoca em toda a organização.',
    iso31000Guidelines: `A ISO 31000 recomenda que cada risco seja identificado de forma única para facilitar:
• Rastreabilidade ao longo do tempo
• Comunicação efetiva entre stakeholders
• Integração com outros sistemas de gestão
• Auditorias e revisões sistemáticas

O código deve seguir uma taxonomia organizacional consistente que permita agrupamento e análise estatística.`,
    howToFill: `1. Use um formato padronizado (ex: RSK-001, TEC-2024-001)
2. Mantenha sequência numérica crescente
3. Considere incluir prefixos por categoria/projeto
4. Evite caracteres especiais ou espaços
5. Garanta que seja único no sistema`,
    examples: [
      'RSK-001: Primeiro risco registrado no sistema',
      'TEC-2024-001: Risco tecnológico do ano de 2024',
      'FIN-PROJ-001: Risco financeiro do projeto específico',
      'OPE-COVID-001: Risco operacional relacionado à pandemia'
    ],
    criteria: [
      'Código deve ser único no sistema',
      'Formato deve seguir padrão organizacional',
      'Não deve conter caracteres especiais',
      'Deve ser facilmente identificável',
      'Máximo de 20 caracteres'
    ],
    relatedFields: ['Nome do Risco', 'Projeto']
  },

  categoria: {
    field: 'categoria',
    title: 'Categoria do Risco',
    definition: 'Classificação sistemática que agrupa riscos de natureza similar para facilitar análise, tratamento e comunicação organizacional.',
    iso31000Guidelines: `A ISO 31000 estabelece que a categorização deve:
• Facilitar a identificação sistemática de riscos
• Permitir análise de padrões e tendências
• Apoiar a alocação de recursos para tratamento
• Melhorar a comunicação e entendimento organizacional

As categorias devem refletir a natureza do negócio e objetivos estratégicos da organização.`,
    howToFill: `1. Selecione a categoria que melhor representa a natureza do risco
2. Considere a fonte primária ou causa raiz
3. Avalie o contexto organizacional
4. Use a taxonomia estabelecida pela organização
5. Em caso de dúvida, consulte gestor de riscos`,
    examples: [
      'Estratégico: Mudanças no mercado que afetam posicionamento competitivo',
      'Operacional: Falha em processo produtivo crítico',
      'Financeiro: Variação cambial impactando custos',
      'Tecnologia: Obsolescência de sistema legado',
      'Conformidade: Mudança em regulamentação setorial',
      'Recursos Humanos: Perda de talento especializado'
    ],
    criteria: [
      'Deve refletir a natureza primária do risco',
      'Seguir taxonomia organizacional',
      'Facilitar agrupamento para análise',
      'Ser mutuamente exclusiva com outras categorias',
      'Permitir relatórios por categoria'
    ],
    relatedFields: ['Nome do Risco', 'Estratégia de Resposta']
  },

  descricao_risco: {
    field: 'descricao_risco',
    title: 'Nome do Risco',
    definition: 'Identificação clara e concisa do evento incerto que, caso ocorra, pode ter efeito positivo ou negativo nos objetivos organizacionais.',
    iso31000Guidelines: `Segundo a ISO 31000, a descrição do risco deve:
• Expressar claramente o evento incerto
• Conectar-se diretamente aos objetivos organizacionais
• Ser específica e mensurável quando possível
• Evitar ambiguidades ou interpretações múltiplas
• Facilitar a identificação de causas e consequências

A descrição é fundamental para todo o processo de gestão de riscos subsequente.`,
    howToFill: `1. Use um nome claro e direto (ex: "Interrupção do sistema ERP")
2. Seja específico mas conciso
3. Evite descrições muito longas ou técnicas demais
4. Foque no evento principal, não nas causas
5. Use linguagem compreensível para todos os stakeholders
6. Mantenha entre 20-150 caracteres para facilitar identificação`,
    examples: [
      'Interrupção do sistema ERP principal',
      'Ataque cibernético aos dados críticos',
      'Indisponibilidade de fornecedor chave',
      'Mudança na legislação setorial',
      'Entrada de novo concorrente no mercado'
    ],
    criteria: [
      'Nome claro e identificável do evento',
      'Conexão com objetivos organizacionais',
      'Linguagem compreensível para stakeholders',
      'Foco no evento principal, não nas causas',
      'Extensão concisa (máximo 150 caracteres)'
    ],
    relatedFields: ['Causas', 'Consequências', 'Categoria']
  },

  causas: {
    field: 'causas',
    title: 'Causas do Risco',
    definition: 'Fatores ou condições que podem dar origem ao risco, representando as origens ou drivers que aumentam a probabilidade de ocorrência do evento.',
    iso31000Guidelines: `A ISO 31000 orienta que a identificação de causas deve:
• Ser abrangente e sistemática
• Distinguir entre causas internas e externas
• Identificar fatores controláveis e não controláveis
• Considerar interações entre diferentes causas
• Apoiar o desenvolvimento de estratégias de tratamento eficazes

As causas bem identificadas facilitam ações preventivas direcionadas.`,
    howToFill: `1. Liste as principais causas ou fatores contribuintes
2. Separe causas internas das externas
3. Identifique causas controláveis pela organização
4. Use análise de causa raiz quando necessário
5. Considere fatores humanos, processos e tecnologia
6. Priorize causas por relevância`,
    examples: [
      'Dependência excessiva de fornecedor único; Falta de plano de contingência',
      'Envelhecimento de equipamentos; Manutenção preventiva inadequada',
      'Rotatividade alta na equipe; Falta de documentação de processos',
      'Mudanças regulatórias frequentes; Sistema de monitoramento deficiente',
      'Pressão competitiva; Ciclo de inovação lento'
    ],
    criteria: [
      'Identificação das principais causas raiz',
      'Distinção entre fatores internos/externos',
      'Foco em fatores controláveis',
      'Linguagem clara e específica',
      'Relevância para desenvolvimento de ações'
    ],
    relatedFields: ['Nome do Risco', 'Ações de Mitigação']
  },

  consequencias: {
    field: 'consequencias',
    title: 'Consequências do Risco',
    definition: 'Resultados ou impactos que podem ocorrer nos objetivos organizacionais caso o evento de risco se materialize, incluindo efeitos positivos ou negativos.',
    iso31000Guidelines: `A ISO 31000 estabelece que as consequências devem:
• Ser expressas em termos dos objetivos organizacionais
• Considerar múltiplas dimensões de impacto
• Incluir efeitos diretos e indiretos
• Ser mensuráveis quando possível
• Considerar diferentes cenários de materialização

A análise de consequências orienta a priorização e alocação de recursos.`,
    howToFill: `1. Identifique impactos nos diferentes objetivos
2. Considere efeitos financeiros, operacionais, reputacionais
3. Avalie impactos diretos e indiretos
4. Quantifique quando possível
5. Considere horizontes de tempo diferentes
6. Inclua stakeholders afetados`,
    examples: [
      'Perda financeira de R$ 1-5M; Atraso de 3-6 meses no projeto; Impacto reputacional',
      'Interrupção operacional por 24-48h; Multas regulatórias; Perda de clientes',
      'Redução de 10-20% na produtividade; Custos extras de terceirização',
      'Exposição legal; Sanções regulatórias; Perda de licenças operacionais',
      'Perda de market share; Necessidade de reestruturação; Demissões'
    ],
    criteria: [
      'Impactos específicos nos objetivos',
      'Quantificação quando possível',
      'Múltiplas dimensões consideradas',
      'Efeitos diretos e indiretos',
      'Diferentes horizontes temporais'
    ],
    relatedFields: ['Impacto', 'Ações de Contingência', 'Estratégia']
  },

  probabilidade: {
    field: 'probabilidade',
    title: 'Probabilidade do Risco',
    definition: 'Chance ou likelihood de que o evento de risco venha a ocorrer, expressa em escala qualitativa ou quantitativa baseada em evidências, dados históricos ou julgamento especializado.',
    iso31000Guidelines: `A ISO 31000 orienta que a análise de probabilidade deve:
• Ser baseada em informações disponíveis e relevantes
• Utilizar métodos apropriados ao contexto
• Considerar a qualidade e confiabilidade dos dados
• Ser consistente com critérios organizacionais
• Ser revisada periodicamente conforme novas informações

A probabilidade pode ser expressa qualitativa ou quantitativamente.`,
    howToFill: `1. Avalie com base em dados históricos quando disponíveis
2. Use julgamento de especialistas quando necessário
3. Considere fatores que influenciam a ocorrência
4. Aplique escala organizacional consistente
5. Documente premissas e fontes utilizadas
6. Revise periodicamente`,
    examples: [
      'Muito Baixa (1): Evento histórico nunca ocorreu, controles robustos',
      'Baixa (2): Evento raro, ocorre menos de 1 vez a cada 5 anos',
      'Média (3): Evento ocasional, ocorre 1-2 vezes por ano',
      'Alta (4): Evento frequente, ocorre várias vezes por ano',
      'Muito Alta (5): Evento quase certo, alta probabilidade de ocorrência'
    ],
    criteria: [
      'Baseada em evidências e dados',
      'Consistente com escala organizacional',
      'Considera controles existentes',
      'Documentação das premissas',
      'Passível de revisão periódica'
    ],
    relatedFields: ['Impacto', 'Nível de Risco', 'Causas']
  },

  impacto: {
    field: 'impacto',
    title: 'Impacto do Risco',
    definition: 'Magnitude ou severidade dos efeitos que o risco pode causar nos objetivos organizacionais, considerando múltiplas dimensões como financeira, operacional, reputacional e estratégica.',
    iso31000Guidelines: `A ISO 31000 estabelece que a avaliação de impacto deve:
• Ser alinhada aos objetivos organizacionais
• Considerar múltiplas dimensões de impacto
• Usar critérios consistentes e mensuráveis
• Refletir a tolerância ao risco da organização
• Ser regularmente revisada e atualizada

O impacto deve refletir o "worst case scenario" realista.`,
    howToFill: `1. Avalie o impacto máximo realista
2. Considere múltiplas dimensões simultaneamente
3. Use critérios monetários quando possível
4. Considere impactos qualitativos relevantes
5. Aplique escala organizacional padrão
6. Considere efeitos em cascata`,
    examples: [
      'Muito Baixo (1): Impacto < R$ 100k, sem efeito operacional significativo',
      'Baixo (2): Impacto R$ 100k-500k, pequeno ajuste operacional',
      'Médio (3): Impacto R$ 500k-2M, interrupção operacional localizada',
      'Alto (4): Impacto R$ 2M-10M, interrupção significativa, impacto reputacional',
      'Muito Alto (5): Impacto > R$ 10M, ameaça à continuidade, impacto estratégico'
    ],
    criteria: [
      'Alinhado aos objetivos organizacionais',
      'Múltiplas dimensões consideradas',
      'Quantificação monetária quando possível',
      'Cenário realista "worst case"',
      'Consistência com tolerância organizacional'
    ],
    relatedFields: ['Probabilidade', 'Consequências', 'Estratégia']
  },

  estrategia: {
    field: 'estrategia',
    title: 'Estratégia de Resposta',
    definition: 'Abordagem sistemática para tratar o risco, baseada nas quatro estratégias fundamentais: evitar, mitigar, transferir ou aceitar, conforme tolerância e apetite ao risco organizacional.',
    iso31000Guidelines: `A ISO 31000 define quatro estratégias principais:

EVITAR: Decidir não iniciar ou continuar com a atividade que origina o risco
• Aplicável quando risco excede tolerância organizacional
• Pode envolver mudança de estratégia ou cancelamento de iniciativa

MITIGAR: Reduzir probabilidade, consequências ou ambos
• Estratégia mais comum, foca em controles preventivos/detectivos
• Inclui melhorias em processos, tecnologia e capacidades

TRANSFERIR: Compartilhar risco com outras partes
• Seguros, contratos, terceirização, parcerias
• Mantém responsabilidade pela gestão do risco

ACEITAR: Manter o risco sem ação adicional
• Quando custo de tratamento supera benefício
• Requer monitoramento contínuo`,
    howToFill: `1. Avalie custo-benefício de cada estratégia
2. Considere capacidades organizacionais
3. Alinhe com apetite e tolerância ao risco
4. Considere impacto em outros riscos
5. Avalie viabilidade de implementação
6. Documente justificativa da escolha`,
    examples: [
      'EVITAR: Cancelar projeto em país com alta instabilidade política',
      'MITIGAR: Implementar backup redundante para sistema crítico',
      'TRANSFERIR: Contratar seguro para cobertura de responsabilidade civil',
      'ACEITAR: Manter exposição a risco de mercado dentro da tolerância'
    ],
    criteria: [
      'Alinhada com tolerância ao risco',
      'Viabilidade técnica e financeira',
      'Considera capacidades organizacionais',
      'Custo-benefício favorável',
      'Impacto em outros riscos considerado'
    ],
    relatedFields: ['Nível de Risco', 'Ações de Mitigação', 'Ações de Contingência']
  },

  acoes_mitigacao: {
    field: 'acoes_mitigacao',
    title: 'Ações de Mitigação',
    definition: 'Medidas preventivas específicas implementadas para reduzir a probabilidade de ocorrência do risco ou minimizar suas consequências potenciais.',
    iso31000Guidelines: `As ações de mitigação devem seguir os princípios da ISO 31000:
• Serem proporcionais ao nível de risco
• Considerarem custo-benefício
• Serem integradas aos processos organizacionais
• Terem responsáveis claramente definidos
• Serem monitoradas quanto à eficácia
• Serem revisadas periodicamente

Devem focar na redução da probabilidade ou do impacto.`,
    howToFill: `1. Defina ações específicas e mensuráveis
2. Estabeleça prazos realistas
3. Atribua responsabilidades claras
4. Considere recursos necessários
5. Priorize por impacto na redução do risco
6. Inclua indicadores de eficácia`,
    examples: [
      'Implementar sistema de backup automático diário; Treinar equipe em procedimentos de recuperação',
      'Diversificar base de fornecedores; Estabelecer contratos com SLA rígidos',
      'Implementar programa de manutenção preventiva; Criar estoque de peças críticas',
      'Desenvolver manual de procedimentos; Certificar equipe em processos críticos'
    ],
    criteria: [
      'Ações específicas e mensuráveis',
      'Prazos e responsáveis definidos',
      'Recursos necessários identificados',
      'Impacto na redução do risco',
      'Indicadores de eficácia estabelecidos'
    ],
    relatedFields: ['Causas', 'Estratégia', 'Responsável', 'Prazo']
  },

  acoes_contingencia: {
    field: 'acoes_contingencia',
    title: 'Ações de Contingência',
    definition: 'Planos de resposta predefinidos que serão ativados caso o risco se materialize, visando minimizar impactos e acelerar a recuperação organizacional.',
    iso31000Guidelines: `Os planos de contingência devem:
• Estar preparados antes da materialização do risco
• Ser testados e validados periodicamente
• Ter gatilhos claros para ativação
• Incluir recursos e responsabilidades definidas
• Ser comunicados aos stakeholders relevantes
• Ser integrados à gestão de continuidade do negócio

Foco na resposta rápida e eficaz quando o risco ocorre.`,
    howToFill: `1. Defina cenários de ativação (gatilhos)
2. Estabeleça sequência de ações imediatas
3. Identifique recursos de emergência necessários
4. Defina cadeia de comunicação e escalação
5. Inclua procedimentos de recuperação
6. Estabeleça critérios de retorno à normalidade`,
    examples: [
      'Ativar site de recuperação em 4h; Comunicar stakeholders via protocolo de crise; Avaliar extensão dos danos',
      'Acionar fornecedor alternativo em 24h; Redistribuir demanda entre plantas; Comunicar clientes sobre possíveis atrasos',
      'Ativar equipe de resposta a incidentes; Isolar sistemas afetados; Restaurar backup mais recente'
    ],
    criteria: [
      'Gatilhos claros para ativação',
      'Sequência lógica de ações',
      'Recursos de emergência identificados',
      'Comunicação e escalação definidas',
      'Procedimentos de recuperação',
      'Testado e validado periodicamente'
    ],
  relatedFields: ['Consequências', 'Estratégia', 'Status', 'Responsável']
  },

  risk_health_score: {
    field: 'risk_health_score',
    title: 'Risk Health Score',
    definition: 'Métrica avançada de saúde organizacional que avalia a maturidade e eficácia da gestão de riscos através de um sistema de pontuação normalizado (0-100 pontos). Combina análise quantitativa de distribuição de riscos, qualidade das ações de mitigação, progresso de implementação e aderência às melhores práticas de governança. O score é calculado internamente em escala 0-85 e normalizado para 0-100 para melhor interpretação e comparação com benchmarks de mercado.',
    iso31000Guidelines: `O Risk Health Score v3.0 alinha-se rigorosamente aos princípios da ISO 31000:
• Monitoramento contínuo baseado em métricas objetivas
• Transparência na comunicação através de score interpretável (0-100)
• Melhoria contínua por identificação de gaps críticos
• Decisão baseada em evidências quantificadas
• Gestão proporcional ao nível de risco identificado

Este indicador reflete a maturidade real da gestão e urgência de ações corretivas em escala padronizada.`,
    howToFill: `O score é calculado automaticamente pelo sistema v3.0 com metodologia normalizada:

🎯 FÓRMULA BASE CONSERVADORA:
• Score interno: calculado em escala 0-85 pontos
• Score apresentado: normalizado para escala 0-100 pontos
• Score máximo possível: 85 pontos

⚠️ PENALIDADES SEVERAS POR RISCO:
• Riscos Críticos: -50 pontos por risco ÷ total
• Riscos Altos: -30 pontos por risco ÷ total  
• Riscos Médios: -10 pontos por risco ÷ total

🎯 PENALIDADES POR GESTÃO DEFICIENTE:
• Sem Responsável: -25 pontos por risco ÷ total
• Sem Prazo: -15 pontos por risco ÷ total
• Status "Identificado" >30 dias: -10 pontos adicionais

📋 CRITÉRIOS RIGOROSOS PARA QUALIDADE DE AÇÕES:
• Excelente (1.0): >500 chars + responsável + prazo + estratégia ativa
• Detalhado (0.6): >300 chars + responsável + prazo
• Adequado (0.3): >150 chars + responsável
• Básico (0.1): >50 chars
• Insuficiente (0.0): <50 chars

🏆 BÔNUS CONSERVADORES (apenas para resultados efetivos):
• Qualidade de ações: máximo 10 pontos
• Progresso de mitigação: apenas se eficiência >50%
• Riscos efetivamente mitigados: proporcional ao total

📊 FAIXAS DE INTERPRETAÇÃO NORMALIZADAS (0-100):

🟢 EXCELENTE (81-100 pontos):
• Gestão de riscos exemplar e madura
• Portfolio equilibrado com poucos riscos críticos (<20%)
• Ações de mitigação robustas com responsáveis e prazos definidos
• Alta eficiência de mitigação (>70%)
• Processos bem estruturados e em conformidade com melhores práticas
• Indicador de organização com governança sólida

🟡 BOM (61-80 pontos):
• Gestão sólida com oportunidades de melhoria identificadas
• Presença moderada de riscos críticos (20-40%)
• Maioria das ações possui responsáveis, alguns prazos indefinidos
• Eficiência de mitigação moderada (40-70%)
• Processos estabelecidos mas com gaps pontuais
• Necessita refinamentos para alcançar excelência

🟠 REGULAR (41-60 pontos):
• Gestão funcional mas com melhorias estruturais necessárias
• Presença significativa de riscos críticos (30-50%)
• Ações básicas definidas, responsabilidades parciais
• Eficiência de mitigação limitada (30-50%)
• Processos em desenvolvimento, controles básicos

🔴 RUIM (21-40 pontos):
• Gestão deficiente, ação corretiva urgente necessária
• Alta concentração de riscos críticos (>50%)
• Deficiências significativas em responsabilidades e prazos
• Baixa eficiência de mitigação (<30%)
• Processos de gestão imaturos

🚨 CRÍTICO (0-20 pontos):
• Situação crítica que demanda intervenção executiva imediata
• Concentração extrema de riscos críticos (>60%)
• Gestão praticamente inexistente
• Eficiência de mitigação muito baixa (<20%)
• Exposição elevada a impactos organizacionais severos

📋 INDICADORES ESPECÍFICOS POR FAIXA NORMALIZADA:
• Score 90-100: Benchmarking de mercado, governança exemplar
• Score 81-89: Gestão sólida, refinamentos pontuais
• Score 71-80: Gestão funcional, melhorias estruturais necessárias
• Score 61-70: Gestão básica, revisão de processos recomendada
• Score 41-60: Gestão com gaps, ações corretivas necessárias
• Score 21-40: Gestão deficiente, ação corretiva urgente
• Score 0-20: Gestão crítica, intervenção executiva imediata

🔍 MÉTRICAS COMPLEMENTARES EXPOSTAS:
• Dashboard de progresso de mitigação (ações → execução → mitigação)
• Eficiência de mitigação em percentual
• Qualidade média das ações de mitigação
• Badges de conquistas por marcos atingidos`,
    examples: [
      'Score 88: Portfolio balanceado, poucos críticos, todos com ações detalhadas e responsáveis',
      'Score 65: Gestão adequada, mas muitos riscos sem prazo ou ações superficiais',
      'Score 35: Portfolio com muitos críticos, gestão deficiente, ações insuficientes',
      'Score 15: Situação crítica - 60% riscos críticos, 87% sem prazo definido',
      'Score 71: Portfolio inicial limpo, baseline para novos projetos'
    ],
    criteria: [
      'Metodologia científica e calibrada com dados reais',
      'Penalidades proporcionais ao risco real para a organização',
      'Premia apenas resultados efetivos de mitigação',
      'Facilita comparação temporal e benchmarking',
      'Orienta priorização baseada em criticidade real',
      'Expõe métricas intermediárias para ação direcionada'
    ],
    relatedFields: ['Nível de Risco', 'Status', 'Responsável', 'Prazo', 'Ações de Mitigação', 'Estratégia', 'Data de Identificação']
  },

  responsavel_id: {
    field: 'responsavel_id',
    title: 'Responsável pelo Risco',
    definition: 'Pessoa com autoridade, recursos e competência para gerenciar o risco, implementar tratamentos e reportar progresso à gestão organizacional.',
    iso31000Guidelines: `O proprietário do risco deve:
• Ter autoridade para tomar decisões sobre o risco
• Ter acesso aos recursos necessários para o tratamento
• Ser responsável pela implementação das ações
• Reportar regularmente o status e progresso
• Estar disponível para escalações e decisões urgentes

A responsabilidade deve ser única e inequívoca.`,
    howToFill: `1. Selecione pessoa com autoridade adequada
2. Considere conhecimento técnico necessário
3. Avalie disponibilidade e capacidade
4. Garanta acesso aos recursos necessários
5. Confirme aceite da responsabilidade
6. Estabeleça frequência de reporte`,
    examples: [
      'Gerente de TI: Para riscos tecnológicos e de sistemas',
      'CFO: Para riscos financeiros e de compliance',
      'Gerente de Operações: Para riscos operacionais e de produção',
      'Gerente de Projetos: Para riscos específicos de projetos',
      'CISO: Para riscos de segurança da informação'
    ],
    criteria: [
      'Autoridade adequada para decisões',
      'Competência técnica relevante',
      'Acesso aos recursos necessários',
      'Disponibilidade para gestão ativa',
      'Aceite formal da responsabilidade'
    ],
    relatedFields: ['Categoria', 'Projeto', 'Status', 'Ações de Mitigação']
  },

  projeto_id: {
    field: 'projeto_id',
    title: 'Projeto Associado',
    definition: 'Projeto ou iniciativa específica ao qual o risco está relacionado, permitindo gestão contextualizada e integrada com objetivos do projeto.',
    iso31000Guidelines: `A gestão de riscos deve estar integrada aos processos organizacionais:
• Riscos de projetos devem ser gerenciados no contexto do projeto
• Facilita a priorização e alocação de recursos
• Permite análise de impacto nos objetivos do projeto
• Melhora a comunicação com stakeholders do projeto
• Integra com metodologias de gestão de projetos`,
    howToFill: `1. Selecione o projeto mais diretamente relacionado
2. Considere impacto nos objetivos do projeto
3. Avalie se é risco específico ou organizacional
4. Confirme com gerente do projeto
5. Considere múltiplos projetos se aplicável
6. Mantenha atualizado conforme evolução`,
    examples: [
      'Projeto de Implementação ERP: Riscos de integração e migração',
      'Projeto de Expansão Internacional: Riscos regulatórios e culturais',
      'Projeto de Transformação Digital: Riscos tecnológicos e de mudança',
      'Projeto de Aquisição: Riscos de due diligence e integração'
    ],
    criteria: [
      'Relação direta com objetivos do projeto',
      'Impacto significativo no projeto',
      'Alinhamento com escopo do projeto',
      'Validação com gerente do projeto',
      'Facilita gestão integrada'
    ],
    relatedFields: ['Responsável', 'Categoria', 'Prazo', 'Status']
  },

  prazo: {
    field: 'prazo',
    title: 'Prazo para Implementação',
    definition: 'Data limite estabelecida para implementação das ações de tratamento do risco, considerando urgência, complexidade e recursos disponíveis.',
    iso31000Guidelines: `O cronograma de tratamento deve:
• Ser proporcional ao nível de risco
• Considerar interdependências com outros riscos
• Ser realista quanto aos recursos disponíveis
• Incluir marcos intermediários para acompanhamento
• Ser comunicado a todos os envolvidos
• Ser revisado conforme mudanças no contexto`,
    howToFill: `1. Avalie urgência baseada no nível de risco
2. Considere complexidade das ações necessárias
3. Verifique disponibilidade de recursos
4. Estabeleça marcos intermediários
5. Valide com responsável pela implementação
6. Considere dependências externas`,
    examples: [
      'Riscos Críticos: 30-60 dias para início das ações',
      'Riscos Altos: 3-6 meses para implementação completa',
      'Riscos Médios: 6-12 meses para tratamento',
      'Revisão trimestral: Para riscos aceitos ou em monitoramento'
    ],
    criteria: [
      'Proporcional ao nível de risco',
      'Realista quanto aos recursos',
      'Considera complexidade das ações',
      'Inclui marcos intermediários',
      'Validado com responsável'
    ],
    relatedFields: ['Nível de Risco', 'Responsável', 'Status', 'Ações de Mitigação']
  },

  status: {
    field: 'status',
    title: 'Status do Risco',
    definition: 'Estado atual do risco no ciclo de vida de gestão, indicando progresso das ações de tratamento e necessidade de atenção gerencial.',
    iso31000Guidelines: `O monitoramento do status deve:
• Refletir o progresso real das ações de tratamento
• Ser atualizado regularmente pelos responsáveis
• Facilitar a priorização da atenção gerencial
• Permitir análise de tendências e padrões
• Ser consistente com critérios organizacionais
• Apoiar a tomada de decisão sobre recursos`,
    howToFill: `1. Avalie progresso das ações de tratamento
2. Considere eficácia das medidas implementadas
3. Verifique cumprimento de prazos
4. Avalie necessidade de ajustes
5. Mantenha atualização regular
6. Comunique mudanças aos stakeholders`,
    examples: [
      'Identificado: Risco mapeado, aguardando análise detalhada',
      'Em Análise: Avaliação de probabilidade e impacto em curso',
      'Em Tratamento: Ações de mitigação sendo implementadas',
      'Monitoramento: Controles implementados, acompanhamento rotineiro',
      'Materializado: Risco ocorreu, ações de contingência ativas',
      'Resolvido: Risco eliminado ou reduzido a nível aceitável'
    ],
    criteria: [
      'Reflete situação real atual',
      'Atualizado regularmente',
      'Consistente com ações realizadas',
      'Facilita priorização gerencial',
      'Comunica necessidade de atenção'
    ],
    relatedFields: ['Ações de Mitigação', 'Responsável', 'Prazo', 'Observações']
  },

  observacoes: {
    field: 'observacoes',
    title: 'Observações',
    definition: 'Informações complementares relevantes para o entendimento completo do risco, incluindo contexto adicional, premissas, limitações ou considerações especiais.',
    iso31000Guidelines: `As observações devem capturar:
• Contexto adicional não coberto em outros campos
• Premissas importantes para a análise
• Limitações dos dados ou análises
• Relacionamentos com outros riscos
• Lições aprendidas de eventos similares
• Considerações específicas do contexto organizacional`,
    howToFill: `1. Inclua informações contextuais relevantes
2. Documente premissas importantes
3. Registre interdependências com outros riscos
4. Anote limitações da análise
5. Inclua histórico de mudanças significativas
6. Mantenha linguagem clara e objetiva`,
    examples: [
      'Risco aumenta durante período de alta demanda (dezembro/janeiro)',
      'Análise baseada em dados dos últimos 3 anos, limitação de histórico',
      'Interdependente com risco RSK-005 (fornecedor crítico)',
      'Impacto pode ser maior em filiais com menor maturidade de processo',
      'Revisão necessária após implementação do novo sistema (Q3/2024)'
    ],
    criteria: [
      'Informações relevantes e úteis',
      'Contexto adicional esclarecedor',
      'Premissas documentadas',
      'Interdependências identificadas',
      'Limitações reconhecidas',
      'Linguagem clara e objetiva'
    ],
    relatedFields: ['Todos os campos podem ter observações relevantes']
  }
};