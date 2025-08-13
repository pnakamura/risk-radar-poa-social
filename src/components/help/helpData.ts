export interface HelpSection {
  id: string;
  title: string;
  icon?: string;
  subsections?: HelpSubsection[];
  content?: React.ReactNode;
}

export interface HelpSubsection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const helpSections: HelpSection[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo',
    icon: 'Home',
    subsections: [
      {
        id: 'what-is',
        title: 'O que é Gestão de Riscos?',
        content: `
          <p>A gestão de riscos é o processo de identificar, avaliar e controlar ameaças ao capital e aos ganhos de uma organização.</p>
          <p>Essas ameaças podem originar-se de várias fontes, incluindo incertezas financeiras, responsabilidades legais, erros de gerenciamento estratégico, acidentes e desastres naturais.</p>
        `
      },
      {
        id: 'why-important',
        title: 'Por que é Importante?',
        content: `
          <ul>
            <li>• <strong>Protege a organização:</strong> Reduz a probabilidade de perdas significativas</li>
            <li>• <strong>Melhora a tomada de decisão:</strong> Fornece informações para decisões estratégicas</li>
            <li>• <strong>Aumenta a eficiência:</strong> Otimiza o uso de recursos</li>
            <li>• <strong>Cria vantagem competitiva:</strong> Organizações bem preparadas se destacam</li>
            <li>• <strong>Atende regulamentações:</strong> Cumpre exigências legais e normativas</li>
          </ul>
        `
      },
      {
        id: 'how-system-helps',
        title: 'Como Este Sistema Ajuda?',
        content: `
          <p>Nosso sistema oferece uma plataforma completa para:</p>
          <ul>
            <li>• <strong>Cadastrar riscos:</strong> Registre e categorize todos os riscos identificados</li>
            <li>• <strong>Avaliar impactos:</strong> Calcule automaticamente níveis de risco</li>
            <li>• <strong>Visualizar dados:</strong> Use dashboards e matrizes para análise visual</li>
            <li>• <strong>Gerar relatórios:</strong> Crie documentos para gestão e auditoria</li>
            <li>• <strong>Acompanhar evolução:</strong> Monitore riscos ao longo do tempo</li>
            <li>• <strong>Colaborar em equipe:</strong> Gerencie usuários e permissões</li>
          </ul>
        `
      },
      {
        id: 'first-steps',
        title: 'Primeiros Passos',
        content: `
          <ol>
            <li><strong>1. Configure seu perfil:</strong> Acesse o menu do usuário e complete suas informações</li>
            <li><strong>2. Explore o Dashboard:</strong> Familiarize-se com os indicadores principais</li>
            <li><strong>3. Cadastre seu primeiro risco:</strong> Use a aba "Gerenciar Riscos" para começar</li>
            <li><strong>4. Visualize na Matriz:</strong> Veja como os riscos são organizados por impacto e probabilidade</li>
            <li><strong>5. Gere um relatório:</strong> Experimente criar suas primeiras análises</li>
          </ol>
        `
      }
    ]
  },
  {
    id: 'concepts',
    title: 'Conceitos Básicos',
    icon: 'BookOpen',
    subsections: [
      {
        id: 'what-is-risk',
        title: 'O que é um Risco?',
        content: `
          <p>Um risco é a <strong>possibilidade de um evento incerto</strong> que pode afetar os objetivos de um projeto ou organização.</p>
          
          <h4>Elementos de um Risco:</h4>
          <ul>
            <li>• <strong>Evento:</strong> O que pode acontecer</li>
            <li>• <strong>Probabilidade:</strong> Chance de o evento ocorrer</li>
            <li>• <strong>Impacto:</strong> Consequências se o evento ocorrer</li>
            <li>• <strong>Causa:</strong> Fatores que podem desencadear o evento</li>
          </ul>

          <div class="bg-blue-50 p-4 rounded-lg mt-4">
            <h5>Exemplo Prático:</h5>
            <p><strong>Risco:</strong> Atraso na entrega de um projeto</p>
            <p><strong>Causa:</strong> Falta de recursos humanos especializados</p>
            <p><strong>Probabilidade:</strong> 60% (Alta)</p>
            <p><strong>Impacto:</strong> Perda de R$ 50.000 e insatisfação do cliente</p>
          </div>
        `
      },
      {
        id: 'risk-types',
        title: 'Tipos de Risco',
        content: `
          <h4>Principais Categorias:</h4>
          
          <div class="space-y-4">
            <div class="border-l-4 border-red-500 pl-4">
              <h5>🏭 Operacional</h5>
              <p>Riscos relacionados aos processos internos, pessoas e sistemas.</p>
              <p><em>Exemplo: Falha de equipamento, erro humano</em></p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>💰 Financeiro</h5>
              <p>Riscos que afetam diretamente a situação financeira.</p>
              <p><em>Exemplo: Flutuação de moedas, inadimplência</em></p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <h5>📋 Regulatório</h5>
              <p>Riscos relacionados ao cumprimento de leis e normas.</p>
              <p><em>Exemplo: Mudança na legislação, auditoria</em></p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>🎯 Estratégico</h5>
              <p>Riscos que afetam objetivos de longo prazo.</p>
              <p><em>Exemplo: Entrada de concorrente, mudança de mercado</em></p>
            </div>
            
            <div class="border-l-4 border-orange-500 pl-4">
              <h5>💻 Tecnológico</h5>
              <p>Riscos relacionados à tecnologia e sistemas.</p>
              <p><em>Exemplo: Cyberataques, obsolescência</em></p>
            </div>
          </div>
        `
      },
      {
        id: 'risk-levels',
        title: 'Níveis de Risco',
        content: `
          <p>Os riscos são classificados em diferentes níveis baseados na combinação de <strong>Probabilidade × Impacto</strong>:</p>
          
          <div class="space-y-3 mt-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <strong>Crítico:</strong> Requer ação imediata e atenção da alta gestão
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-orange-500 rounded"></div>
              <div>
                <strong>Alto:</strong> Deve ser tratado prioritariamente
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-yellow-500 rounded"></div>
              <div>
                <strong>Médio:</strong> Requer monitoramento regular
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-blue-500 rounded"></div>
              <div>
                <strong>Baixo:</strong> Pode ser aceito com monitoramento básico
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-green-500 rounded"></div>
              <div>
                <strong>Muito Baixo:</strong> Riscos aceitáveis
              </div>
            </div>
          </div>
        `
      },
      {
        id: 'risk-lifecycle',
        title: 'Ciclo de Vida do Risco',
        content: `
          <p>Cada risco passa por diferentes fases durante seu gerenciamento:</p>
          
          <div class="space-y-4 mt-4">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📝 1. Identificação</h5>
              <p>Descoberta e registro inicial do risco</p>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded">
              <h5>📊 2. Análise</h5>
              <p>Avaliação de probabilidade e impacto</p>
            </div>
            
            <div class="bg-orange-50 p-3 rounded">
              <h5>🎯 3. Tratamento</h5>
              <p>Definição e implementação de ações</p>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>👁️ 4. Monitoramento</h5>
              <p>Acompanhamento contínuo da evolução</p>
            </div>
            
            <div class="bg-gray-50 p-3 rounded">
              <h5>✅ 5. Encerramento</h5>
              <p>Finalização quando o risco não é mais relevante</p>
            </div>
          </div>
        `
      },
      {
        id: 'iso31000',
        title: 'ISO 31000 Simplificada',
        content: `
          <p>A <strong>ISO 31000</strong> é a norma internacional para gestão de riscos. Ela estabelece princípios e diretrizes gerais.</p>
          
          <h4>Princípios Fundamentais:</h4>
          <ul>
            <li>• <strong>Cria valor:</strong> A gestão de riscos contribui para alcançar objetivos</li>
            <li>• <strong>É parte integral:</strong> Deve fazer parte de todos os processos organizacionais</li>
            <li>• <strong>Suporta decisões:</strong> Ajuda na tomada de decisões informadas</li>
            <li>• <strong>É sistemática:</strong> Segue uma abordagem estruturada e consistente</li>
            <li>• <strong>É iterativa:</strong> Processo contínuo de melhoria</li>
          </ul>
          
          <h4>Processo da ISO 31000:</h4>
          <ol>
            <li><strong>Estabelecer contexto:</strong> Definir ambiente interno e externo</li>
            <li><strong>Identificar riscos:</strong> Encontrar, reconhecer e descrever riscos</li>
            <li><strong>Analisar riscos:</strong> Compreender natureza e características</li>
            <li><strong>Avaliar riscos:</strong> Comparar resultados com critérios</li>
            <li><strong>Tratar riscos:</strong> Implementar opções de tratamento</li>
          </ol>
        `
      }
    ]
  },
  {
    id: 'modules',
    title: 'Usando o Sistema',
    icon: 'Settings',
    subsections: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        content: `
          <p>O Dashboard é sua visão geral do status dos riscos em tempo real.</p>
          
          <h4>Principais Componentes:</h4>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📊 Score de Saúde dos Riscos</h5>
              <p>Indicador geral que varia de 0 a 100, mostrando a situação geral dos riscos.</p>
              <ul>
                <li>• 80-100: Excelente (verde)</li>
                <li>• 60-79: Bom (azul)</li>
                <li>• 40-59: Atenção (amarelo)</li>
                <li>• 20-39: Preocupante (laranja)</li>
                <li>• 0-19: Crítico (vermelho)</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>🔥 Mapa de Calor por Categoria</h5>
              <p>Visualização que mostra quais categorias têm mais riscos concentrados.</p>
              <p>Cores mais intensas indicam maior concentração de riscos.</p>
            </div>
            
            <div class="bg-purple-50 p-3 rounded">
              <h5>📈 Gráfico Radar</h5>
              <p>Mostra a distribuição de riscos por categoria em formato de radar.</p>
              <p>Permite identificar rapidamente categorias com mais exposição.</p>
            </div>
            
            <div class="bg-orange-50 p-3 rounded">
              <h5>⏰ Linha do Tempo</h5>
              <p>Histórico cronológico das atividades recentes do sistema.</p>
              <p>Inclui criação, edição e mudanças de status dos riscos.</p>
            </div>
          </div>
        `
      },
      {
        id: 'matrix',
        title: 'Matriz de Riscos',
        content: `
          <p>A Matriz de Riscos é a visualização principal para analisar e gerenciar riscos.</p>
          
          <h4>Como Usar:</h4>
          
          <div class="space-y-4">
            <div>
              <h5>🎯 Visualização da Matriz</h5>
              <p>A matriz organiza os riscos em um grid de <strong>Probabilidade × Impacto</strong>:</p>
              <ul>
                <li>• <strong>Eixo Y (Vertical):</strong> Probabilidade (Muito Baixa → Muito Alta)</li>
                <li>• <strong>Eixo X (Horizontal):</strong> Impacto (Muito Baixo → Muito Alto)</li>
                <li>• <strong>Cores:</strong> Indicam o nível de risco resultante</li>
              </ul>
            </div>
            
            <div>
              <h5>🔍 Filtros Disponíveis</h5>
              <ul>
                <li>• <strong>Categoria:</strong> Filtre por tipo de risco</li>
                <li>• <strong>Status:</strong> Veja apenas riscos em determinada fase</li>
                <li>• <strong>Projeto:</strong> Foque em riscos de projetos específicos</li>
                <li>• <strong>Responsável:</strong> Veja riscos atribuídos a pessoas</li>
                <li>• <strong>Nível de Risco:</strong> Filtre por criticidade</li>
              </ul>
            </div>
            
            <div>
              <h5>📱 Modos de Visualização</h5>
              <ul>
                <li>• <strong>Cards:</strong> Visualização em cartões (padrão)</li>
                <li>• <strong>Tabela:</strong> Lista detalhada com ordenação</li>
                <li>• <strong>Matriz Visual:</strong> Grid tradicional de risco</li>
              </ul>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded">
              <h5>💡 Dica:</h5>
              <p>Riscos no canto superior direito (alta probabilidade + alto impacto) requerem atenção imediata!</p>
            </div>
          </div>
        `
      },
      {
        id: 'reports',
        title: 'Relatórios',
        content: `
          <p>O módulo de Relatórios permite gerar análises detalhadas e documentos para gestão.</p>
          
          <h4>Tipos de Relatório:</h4>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📊 Relatório Executivo</h5>
              <p>Visão resumida para alta gestão:</p>
              <ul>
                <li>• Resumo do score de saúde</li>
                <li>• Top riscos críticos</li>
                <li>• Tendências principais</li>
                <li>• Recomendações de ação</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>📋 Relatório Detalhado</h5>
              <p>Análise completa para equipes técnicas:</p>
              <ul>
                <li>• Lista completa de riscos</li>
                <li>• Análises por categoria</li>
                <li>• Histórico de mudanças</li>
                <li>• Ações pendentes</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 p-3 rounded">
              <h5>🎯 Relatório por Projeto</h5>
              <p>Foco em projetos específicos:</p>
              <ul>
                <li>• Riscos do projeto selecionado</li>
                <li>• Status das mitigações</li>
                <li>• Cronograma de ações</li>
                <li>• Indicadores específicos</li>
              </ul>
            </div>
          </div>
          
          <h4>Formatos de Exportação:</h4>
          <ul>
            <li>• <strong>PDF:</strong> Para apresentações e documentação formal</li>
            <li>• <strong>Excel:</strong> Para análises adicionais e manipulação de dados</li>
            <li>• <strong>PNG:</strong> Para inclusão em outras apresentações</li>
          </ul>
        `
      },
      {
        id: 'risk-form',
        title: 'Cadastro de Riscos',
        content: `
          <p>Use este módulo para registrar novos riscos ou editar riscos existentes.</p>
          
          <h4>Campos Principais:</h4>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📝 Informações Básicas</h5>
              <ul>
                <li>• <strong>Código:</strong> Identificador único (auto-gerado)</li>
                <li>• <strong>Categoria:</strong> Tipo do risco (Operacional, Financeiro, etc.)</li>
                <li>• <strong>Descrição:</strong> O que é o risco (evento incerto)</li>
                <li>• <strong>Projeto:</strong> Qual projeto é afetado</li>
                <li>• <strong>Responsável:</strong> Quem cuida do risco</li>
              </ul>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded">
              <h5>📊 Avaliação do Risco</h5>
              <ul>
                <li>• <strong>Probabilidade:</strong> Chance de ocorrer (1-5)</li>
                <li>• <strong>Impacto:</strong> Consequência se ocorrer (1-5)</li>
                <li>• <strong>Proximidade:</strong> Quando pode acontecer</li>
                <li>• <strong>Detectabilidade:</strong> Facilidade de identificar</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>🛡️ Estratégia de Resposta</h5>
              <ul>
                <li>• <strong>Evitar:</strong> Eliminar a possibilidade</li>
                <li>• <strong>Mitigar:</strong> Reduzir probabilidade ou impacto</li>
                <li>• <strong>Transferir:</strong> Passar para terceiros (seguro)</li>
                <li>• <strong>Aceitar:</strong> Assumir o risco conscientemente</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 p-3 rounded">
              <h5>🎯 Controles e Ações</h5>
              <ul>
                <li>• <strong>Controles Existentes:</strong> O que já está sendo feito</li>
                <li>• <strong>Ações Adicionais:</strong> O que será implementado</li>
                <li>• <strong>Prazos:</strong> Quando as ações devem ser concluídas</li>
                <li>• <strong>Recursos:</strong> Orçamento necessário</li>
              </ul>
            </div>
          </div>
          
          <div class="bg-yellow-100 p-4 rounded mt-4">
            <h5>💡 Dicas para um Bom Cadastro:</h5>
            <ul>
              <li>• Seja específico na descrição do risco</li>
              <li>• Use a ajuda contextual (?) ao lado de cada campo</li>
              <li>• Defina ações concretas e mensuráveis</li>
              <li>• Estabeleça prazos realistas</li>
              <li>• Revise periodicamente os riscos cadastrados</li>
            </ul>
          </div>
        `
      },
      {
        id: 'master-data',
        title: 'Dados Mestres',
        content: `
          <p>Os Dados Mestres são informações básicas que sustentam todo o sistema de gestão de riscos.</p>
          
          <h4>O que são Dados Mestres?</h4>
          <p>São informações fundamentais como projetos, perfis de usuário e configurações que são referenciadas em todo o sistema.</p>
          
          <div class="space-y-4">
            <div class="bg-blue-50 p-3 rounded">
              <h5>🏗️ Projetos</h5>
              <p>Cadastre e gerencie os projetos da organização:</p>
              <ul>
                <li>• <strong>Nome:</strong> Identificação do projeto</li>
                <li>• <strong>Descrição:</strong> Objetivo e escopo</li>
                <li>• <strong>Status:</strong> Planejamento, Execução, Finalizado</li>
                <li>• <strong>Datas:</strong> Início e fim previstos</li>
                <li>• <strong>Responsável:</strong> Gerente do projeto</li>
                <li>• <strong>Orçamento:</strong> Valor total aprovado</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>👤 Perfis</h5>
              <p>Gerencie informações dos usuários:</p>
              <ul>
                <li>• <strong>Dados Pessoais:</strong> Nome, email, telefone</li>
                <li>• <strong>Cargo:</strong> Função na organização</li>
                <li>• <strong>Departamento:</strong> Área de atuação</li>
                <li>• <strong>Especialidades:</strong> Áreas de conhecimento</li>
                <li>• <strong>Certificações:</strong> Qualificações relevantes</li>
              </ul>
            </div>
          </div>
          
          <h4>Por que é Importante?</h4>
          <ul>
            <li>• <strong>Consistência:</strong> Garante dados uniformes em todo sistema</li>
            <li>• <strong>Relatórios:</strong> Permite análises por projeto e responsável</li>
            <li>• <strong>Rastreabilidade:</strong> Histórico completo de responsabilidades</li>
            <li>• <strong>Eficiência:</strong> Evita retrabalho na criação de riscos</li>
          </ul>
        `
      },
      {
        id: 'users',
        title: 'Usuários (Administradores)',
        content: `
          <p>O módulo de Usuários permite gerenciar acesso e permissões no sistema.</p>
          
          <h4>Níveis de Permissão:</h4>
          
          <div class="space-y-3">
            <div class="bg-red-50 p-3 rounded">
              <h5>👑 Administrador</h5>
              <ul>
                <li>• Acesso total ao sistema</li>
                <li>• Gerencia usuários e permissões</li>
                <li>• Configura dados mestres</li>
                <li>• Acesso a todos os projetos</li>
              </ul>
            </div>
            
            <div class="bg-orange-50 p-3 rounded">
              <h5>🏢 Gestor</h5>
              <ul>
                <li>• Gerencia riscos de seus projetos</li>
                <li>• Cria e edita riscos</li>
                <li>• Gera relatórios</li>
                <li>• Visualiza dashboard</li>
              </ul>
            </div>
            
            <div class="bg-blue-50 p-3 rounded">
              <h5>📊 Analista</h5>
              <ul>
                <li>• Cadastra e analisa riscos</li>
                <li>• Atualiza status e avaliações</li>
                <li>• Gera relatórios básicos</li>
                <li>• Acesso limitado por projeto</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 p-3 rounded">
              <h5>👁️ Visualizador</h5>
              <ul>
                <li>• Apenas leitura</li>
                <li>• Visualiza dashboard e matriz</li>
                <li>• Acessa relatórios existentes</li>
                <li>• Não pode criar ou editar</li>
              </ul>
            </div>
          </div>
          
          <h4>Como Gerenciar Usuários:</h4>
          <ol>
            <li><strong>Adicionar Usuário:</strong> Clique em "Novo Usuário" e preencha os dados</li>
            <li><strong>Definir Permissões:</strong> Escolha o nível apropriado</li>
            <li><strong>Associar Projetos:</strong> Determine quais projetos o usuário pode acessar</li>
            <li><strong>Ativar/Desativar:</strong> Controle acesso sem excluir o usuário</li>
            <li><strong>Auditar Acesso:</strong> Monitore quem acessa o quê</li>
          </ol>
        `
      }
    ]
  },
  {
    id: 'tutorials',
    title: 'Tutoriais Práticos',
    icon: 'PlayCircle',
    subsections: [
      {
        id: 'first-risk',
        title: 'Tutorial: Meu Primeiro Risco',
        content: `
          <p>Vamos cadastrar seu primeiro risco passo a passo!</p>
          
          <h4>Passo 1: Acesse o Formulário</h4>
          <ol>
            <li>Na página principal, clique na aba <strong>"Gerenciar Riscos"</strong></li>
            <li>Você verá o formulário de cadastro</li>
          </ol>
          
          <h4>Passo 2: Informações Básicas</h4>
          <ol>
            <li><strong>Categoria:</strong> Escolha "Operacional" para nosso exemplo</li>
            <li><strong>Descrição do Risco:</strong> Digite "Atraso na entrega do projeto por falta de recursos"</li>
            <li><strong>Projeto:</strong> Selecione um projeto existente ou crie um novo</li>
            <li><strong>Responsável:</strong> Escolha quem será responsável pelo risco</li>
          </ol>
          
          <h4>Passo 3: Avaliação</h4>
          <ol>
            <li><strong>Probabilidade:</strong> Selecione "4 - Alta" (70-80% de chance)</li>
            <li><strong>Impacto:</strong> Selecione "3 - Médio" (impacto moderado)</li>
            <li><strong>Proximidade:</strong> Escolha "Próximo" (1-3 meses)</li>
            <li><strong>Detectabilidade:</strong> Selecione "Média"</li>
          </ol>
          
          <h4>Passo 4: Estratégia de Resposta</h4>
          <ol>
            <li><strong>Estratégia:</strong> Escolha "Mitigar"</li>
            <li><strong>Justificativa:</strong> "Vamos contratar consultores externos para acelerar o projeto"</li>
          </ol>
          
          <h4>Passo 5: Controles e Ações</h4>
          <ol>
            <li><strong>Controles Existentes:</strong> "Reuniões semanais de acompanhamento"</li>
            <li><strong>Ações Adicionais:</strong> "Contratar 2 consultores sênior até o final do mês"</li>
            <li><strong>Prazo:</strong> Defina uma data realista</li>
            <li><strong>Recursos Necessários:</strong> "R$ 50.000 para contratação"</li>
          </ol>
          
          <h4>Passo 6: Salvar</h4>
          <ol>
            <li>Revise todas as informações</li>
            <li>Clique em <strong>"Salvar Risco"</strong></li>
            <li>Pronto! Seu primeiro risco foi cadastrado</li>
          </ol>
          
          <div class="bg-green-100 p-4 rounded mt-4">
            <h5>🎉 Parabéns!</h5>
            <p>Agora você pode visualizar seu risco na Matriz de Riscos e no Dashboard!</p>
          </div>
        `
      },
      {
        id: 'analyzing-trends',
        title: 'Tutorial: Analisando Tendências',
        content: `
          <p>Aprenda a usar relatórios para identificar padrões e tendências nos seus riscos.</p>
          
          <h4>Passo 1: Acesse os Relatórios</h4>
          <ol>
            <li>Clique na aba <strong>"Relatórios"</strong></li>
            <li>Você verá três tipos de relatório disponíveis</li>
          </ol>
          
          <h4>Passo 2: Configure o Período</h4>
          <ol>
            <li>Defina o período de análise (últimos 3 meses é um bom começo)</li>
            <li>Escolha se quer ver todos os projetos ou apenas alguns específicos</li>
          </ol>
          
          <h4>Passo 3: Gere o Relatório Executivo</h4>
          <ol>
            <li>Clique em <strong>"Gerar Relatório Executivo"</strong></li>
            <li>Aguarde a geração do documento</li>
          </ol>
          
          <h4>Passo 4: Analise os Resultados</h4>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📊 Score de Saúde</h5>
              <ul>
                <li>• Score baixando? Novos riscos ou agravamento dos existentes</li>
                <li>• Score subindo? Ações de mitigação estão funcionando</li>
                <li>• Score estável? Situação controlada</li>
              </ul>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded">
              <h5>📈 Distribuição por Categoria</h5>
              <ul>
                <li>• Qual categoria tem mais riscos?</li>
                <li>• Onde estão os riscos mais críticos?</li>
                <li>• Que área precisa de mais atenção?</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>⏰ Evolução Temporal</h5>
              <ul>
                <li>• Quantidade de riscos está crescendo?</li>
                <li>• Riscos estão sendo resolvidos?</li>
                <li>• Há padrões sazonais?</li>
              </ul>
            </div>
          </div>
          
          <h4>Passo 5: Identifique Ações</h4>
          <p>Com base na análise, defina ações específicas:</p>
          <ul>
            <li>• Categorias com muitos riscos → Revisar processos</li>
            <li>• Riscos antigos sem solução → Reavaliação de estratégia</li>
            <li>• Tendência crescente → Investigar causas raiz</li>
          </ul>
          
          <h4>Passo 6: Compartilhe os Resultados</h4>
          <ol>
            <li>Exporte o relatório em PDF</li>
            <li>Compartilhe com a equipe e gestão</li>
            <li>Agende revisões periódicas</li>
          </ol>
        `
      },
      {
        id: 'continuous-monitoring',
        title: 'Tutorial: Monitoramento Contínuo',
        content: `
          <p>Configure um sistema eficaz de monitoramento contínuo dos seus riscos.</p>
          
          <h4>Configurando Alertas Visuais</h4>
          
          <div class="space-y-3">
            <div class="bg-red-50 p-3 rounded">
              <h5>🚨 Riscos Críticos</h5>
              <p>No Dashboard, sempre verifique primeiro:</p>
              <ul>
                <li>• Riscos na zona vermelha da matriz</li>
                <li>• Score de saúde abaixo de 60</li>
                <li>• Alertas na linha do tempo</li>
              </ul>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded">
              <h5>⚡ Ações Vencidas</h5>
              <p>Identifique rapidamente:</p>
              <ul>
                <li>• Riscos com ações em atraso</li>
                <li>• Prazos próximos do vencimento</li>
                <li>• Controles que precisam de revisão</li>
              </ul>
            </div>
          </div>
          
          <h4>Rotina de Monitoramento Semanal</h4>
          <ol>
            <li><strong>Segunda-feira:</strong> Revisar Dashboard geral</li>
            <li><strong>Terça-feira:</strong> Analisar riscos críticos</li>
            <li><strong>Quarta-feira:</strong> Verificar ações pendentes</li>
            <li><strong>Quinta-feira:</strong> Atualizar status dos riscos</li>
            <li><strong>Sexta-feira:</strong> Preparar relatório semanal</li>
          </ol>
          
          <h4>Rotina de Monitoramento Mensal</h4>
          <ol>
            <li><strong>Semana 1:</strong> Análise de tendências</li>
            <li><strong>Semana 2:</strong> Revisão de categorias</li>
            <li><strong>Semana 3:</strong> Avaliação de controles</li>
            <li><strong>Semana 4:</strong> Planejamento do próximo mês</li>
          </ol>
          
          <h4>Indicadores Chave para Acompanhar</h4>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📊 Quantitativos</h5>
              <ul>
                <li>• Total de riscos ativos</li>
                <li>• Riscos por nível de criticidade</li>
                <li>• Percentual de ações no prazo</li>
                <li>• Tempo médio de resolução</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>🎯 Qualitativos</h5>
              <ul>
                <li>• Eficácia dos controles</li>
                <li>• Qualidade das análises</li>
                <li>• Engajamento da equipe</li>
                <li>• Maturidade do processo</li>
              </ul>
            </div>
          </div>
          
          <h4>Quando Escalar um Risco</h4>
          <p>Comunique imediatamente à gestão quando:</p>
          <ul>
            <li>• Risco se torna crítico (vermelho)</li>
            <li>• Ações de mitigação não estão funcionando</li>
            <li>• Impacto ou probabilidade aumentam significativamente</li>
            <li>• Recursos adicionais são necessários</li>
            <li>• Prazos críticos estão em risco</li>
          </ul>
        `
      },
      {
        id: 'export-sharing',
        title: 'Tutorial: Exportação e Compartilhamento',
        content: `
          <p>Aprenda a gerar e compartilhar informações de riscos de forma eficaz.</p>
          
          <h4>Tipos de Exportação Disponíveis</h4>
          
          <div class="space-y-3">
            <div class="bg-blue-50 p-3 rounded">
              <h5>📄 PDF</h5>
              <p><strong>Melhor para:</strong> Apresentações, documentação oficial, aprovações</p>
              <ul>
                <li>• Mantém formatação original</li>
                <li>• Ideal para impressão</li>
                <li>• Fácil de compartilhar</li>
              </ul>
            </div>
            
            <div class="bg-green-50 p-3 rounded">
              <h5>📊 Excel</h5>
              <p><strong>Melhor para:</strong> Análises adicionais, manipulação de dados</p>
              <ul>
                <li>• Permite filtros e ordenação</li>
                <li>• Cálculos personalizados</li>
                <li>• Gráficos adicionais</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 p-3 rounded">
              <h5>🖼️ PNG</h5>
              <p><strong>Melhor para:</strong> Inclusão em apresentações, dashboards externos</p>
              <ul>
                <li>• Alta qualidade visual</li>
                <li>• Fácil inserção em slides</li>
                <li>• Carregamento rápido</li>
              </ul>
            </div>
          </div>
          
          <h4>Como Exportar Relatórios</h4>
          <ol>
            <li>Acesse a aba <strong>"Relatórios"</strong></li>
            <li>Configure os filtros desejados (período, projetos, categorias)</li>
            <li>Clique em <strong>"Exportar"</strong></li>
            <li>Escolha o formato (PDF, Excel ou PNG)</li>
            <li>Aguarde a geração e download automático</li>
          </ol>
          
          <h4>Como Exportar Riscos Individuais</h4>
          <ol>
            <li>Na Matriz de Riscos, clique no risco desejado</li>
            <li>Na página de detalhes, clique em <strong>"Exportar"</strong></li>
            <li>Escolha o formato</li>
            <li>O arquivo será gerado com todas as informações do risco</li>
          </ol>
          
          <h4>Boas Práticas para Compartilhamento</h4>
          
          <div class="space-y-3">
            <div class="bg-yellow-50 p-3 rounded">
              <h5>👥 Para a Equipe Técnica</h5>
              <ul>
                <li>• Use formato Excel para análises detalhadas</li>
                <li>• Inclua filtros de categoria e projeto</li>
                <li>• Adicione comentários explicativos</li>
              </ul>
            </div>
            
            <div class="bg-orange-50 p-3 rounded">
              <h5>🏢 Para a Gestão</h5>
              <ul>
                <li>• Use formato PDF para relatórios executivos</li>
                <li>• Foque em riscos críticos e tendências</li>
                <li>• Inclua recomendações de ação</li>
              </ul>
            </div>
            
            <div class="bg-gray-50 p-3 rounded">
              <h5>📈 Para Apresentações</h5>
              <ul>
                <li>• Use formato PNG para gráficos</li>
                <li>• Exporte visualizações específicas</li>
                <li>• Mantenha qualidade alta para projeção</li>
              </ul>
            </div>
          </div>
          
          <h4>Agendamento de Relatórios</h4>
          <p>Para relatórios recorrentes:</p>
          <ol>
            <li>Configure os filtros padrão</li>
            <li>Salve as configurações</li>
            <li>Estabeleça frequência (semanal, mensal)</li>
            <li>Defina lista de distribuição</li>
            <li>Automatize o processo</li>
          </ol>
          
          <div class="bg-blue-100 p-4 rounded mt-4">
            <h5>💡 Dica Pro:</h5>
            <p>Crie templates de relatório para diferentes audiências e reutilize as configurações!</p>
          </div>
        `
      }
    ]
  },
  {
    id: 'faq',
    title: 'Perguntas Frequentes',
    icon: 'HelpCircle',
    subsections: [
      {
        id: 'system-faq',
        title: 'Sobre o Sistema',
        content: `
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>❓ Como faço para redefinir minha senha?</h5>
              <p><strong>R:</strong> Entre em contato com o administrador do sistema. Apenas administradores podem redefinir senhas de usuários.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>❓ Posso acessar o sistema pelo celular?</h5>
              <p><strong>R:</strong> Sim! O sistema é responsivo e funciona bem em dispositivos móveis. Recomendamos usar no modo paisagem para melhor visualização.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>❓ Os dados são salvos automaticamente?</h5>
              <p><strong>R:</strong> Não. Sempre clique em "Salvar" ao terminar de preencher um formulário. Dados não salvos serão perdidos.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>❓ Posso trabalhar offline?</h5>
              <p><strong>R:</strong> Não. O sistema requer conexão com a internet para funcionar, pois os dados são armazenados na nuvem.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>❓ Como sei se minhas alterações foram salvas?</h5>
              <p><strong>R:</strong> O sistema mostra uma mensagem de confirmação (toast verde) no canto da tela quando dados são salvos com sucesso.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <h5>❓ Posso desfazer uma ação?</h5>
              <p><strong>R:</strong> Algumas ações podem ser desfeitas (como edições), mas exclusões são permanentes. Sempre confirme antes de excluir dados.</p>
            </div>
          </div>
        `
      },
      {
        id: 'risks-faq',
        title: 'Sobre Riscos',
        content: `
          <div class="space-y-4">
            <div class="border-l-4 border-green-500 pl-4">
              <h5>❓ Qual a diferença entre risco e problema?</h5>
              <p><strong>R:</strong> Risco é algo que <em>pode</em> acontecer no futuro. Problema é algo que <em>já está</em> acontecendo. Registre apenas riscos (eventos futuros incertos).</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <h5>❓ Como avalio a probabilidade corretamente?</h5>
              <p><strong>R:</strong> Use dados históricos quando possível, ou a experiência da equipe. 1=Muito Baixa (&lt;10%), 2=Baixa (10-30%), 3=Média (30-50%), 4=Alta (50-80%), 5=Muito Alta (&gt;80%).</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <h5>❓ Posso ter riscos positivos (oportunidades)?</h5>
              <p><strong>R:</strong> Este sistema foca em riscos negativos (ameaças). Para oportunidades, use a categoria "Estratégico" e descreva como um risco de "perder a oportunidade".</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <h5>❓ Com que frequência devo revisar os riscos?</h5>
              <p><strong>R:</strong> Riscos críticos: semanalmente. Riscos altos: quinzenalmente. Riscos médios/baixos: mensalmente. Sempre revise quando há mudanças no projeto.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <h5>❓ Quando devo encerrar um risco?</h5>
              <p><strong>R:</strong> Quando: 1) O evento não pode mais ocorrer, 2) O projeto terminou, 3) O risco foi completamente mitigado, ou 4) Aceito formalmente pela gestão.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <h5>❓ Quantos riscos devo ter por projeto?</h5>
              <p><strong>R:</strong> Não há número ideal. Projetos pequenos podem ter 5-10 riscos, projetos grandes podem ter 50+. Foque na qualidade, não na quantidade.</p>
            </div>
          </div>
        `
      },
      {
        id: 'reports-faq',
        title: 'Sobre Relatórios',
        content: `
          <div class="space-y-4">
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>❓ Por que meu relatório está vazio?</h5>
              <p><strong>R:</strong> Verifique os filtros aplicados (período, projeto, categoria). Pode ser que não existam riscos que atendam aos critérios selecionados.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>❓ Qual formato devo escolher para cada situação?</h5>
              <p><strong>R:</strong> PDF para apresentações formais, Excel para análises detalhadas, PNG para inclusão em outros documentos. CSV para integração com outros sistemas.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>❓ Os relatórios incluem dados históricos?</h5>
              <p><strong>R:</strong> Sim, você pode definir o período desejado. O sistema mantém histórico completo de todas as mudanças nos riscos.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>❓ Posso personalizar os relatórios?</h5>
              <p><strong>R:</strong> Os relatórios têm formatos pré-definidos, mas você pode usar filtros para incluir apenas os dados desejados. Para personalizações avançadas, use a exportação Excel.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>❓ Como interpreto o Score de Saúde?</h5>
              <p><strong>R:</strong> O Score varia de 0 a 100. Considera quantidade, criticidade e tendência dos riscos. Acima de 80 é excelente, abaixo de 40 requer atenção imediata.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4">
              <h5>❓ Por que alguns dados não aparecem no relatório?</h5>
              <p><strong>R:</strong> Usuários só veem dados dos projetos aos quais têm acesso. Administradores veem todos os dados, outros usuários têm acesso limitado conforme suas permissões.</p>
            </div>
          </div>
        `
      },
      {
        id: 'technical-faq',
        title: 'Problemas Técnicos',
        content: `
          <div class="space-y-4">
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ A página não carrega ou fica em branco</h5>
              <p><strong>R:</strong> 1) Atualize a página (F5), 2) Limpe o cache do navegador, 3) Tente outro navegador, 4) Verifique sua conexão de internet.</p>
            </div>
            
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ Não consigo fazer login</h5>
              <p><strong>R:</strong> Verifique se email e senha estão corretos. Se esqueceu a senha, entre em contato com o administrador. Certifique-se de que seu usuário está ativo.</p>
            </div>
            
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ Os filtros não funcionam</h5>
              <p><strong>R:</strong> Aguarde o carregamento completo da página antes de aplicar filtros. Se o problema persistir, recarregue a página.</p>
            </div>
            
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ Erro ao salvar dados</h5>
              <p><strong>R:</strong> Verifique se todos os campos obrigatórios estão preenchidos. Se o erro persistir, pode ser problema de conexão - tente novamente em alguns minutos.</p>
            </div>
            
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ Exportação não funciona</h5>
              <p><strong>R:</strong> Verifique se seu navegador permite downloads. Desative bloqueadores de pop-up. Tente um formato diferente (PDF em vez de Excel).</p>
            </div>
            
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ Sistema lento</h5>
              <p><strong>R:</strong> Pode ser devido a muitos dados ou conexão lenta. Tente usar filtros para reduzir a quantidade de dados exibidos. Feche outras abas do navegador.</p>
            </div>
            
            <div class="border-l-4 border-red-500 pl-4">
              <h5>❓ Quando devo entrar em contato com o suporte?</h5>
              <p><strong>R:</strong> Se os problemas persistirem após tentar as soluções acima, se houver perda de dados, ou se você precisar de mudanças de permissão/acesso.</p>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: 'glossary',
    title: 'Glossário',
    icon: 'Book',
    subsections: [
      {
        id: 'glossary-content',
        title: 'Termos e Definições',
        content: `
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Análise de Risco</strong></h5>
              <p>Processo de compreender a natureza do risco e determinar seu nível. Inclui avaliação de probabilidade e impacto.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Apetite a Risco</strong></h5>
              <p>Quantidade e tipo de risco que uma organização está disposta a aceitar em busca de seus objetivos.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Avaliação de Risco</strong></h5>
              <p>Processo de comparar os resultados da análise de risco com critérios de risco para determinar se o risco é aceitável.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Categoria de Risco</strong></h5>
              <p>Agrupamento de riscos baseado em características comuns. Ex: Operacional, Financeiro, Estratégico, etc.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Controle</strong></h5>
              <p>Medida que modifica o risco. Pode incluir processos, políticas, dispositivos, práticas ou outras ações.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Detectabilidade</strong></h5>
              <p>Capacidade de identificar quando um risco está se materializando, permitindo resposta rápida.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Estratégia de Resposta</strong></h5>
              <p>Abordagem para lidar com o risco: Evitar, Mitigar, Transferir ou Aceitar.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Evento de Risco</strong></h5>
              <p>Ocorrência ou mudança em circunstâncias particulares que podem afetar os objetivos.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Gestão de Risco</strong></h5>
              <p>Atividades coordenadas para dirigir e controlar uma organização no que se refere ao risco.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Identificação de Risco</strong></h5>
              <p>Processo de encontrar, reconhecer e descrever riscos que podem afetar os objetivos.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Impacto</strong></h5>
              <p>Consequência de um evento que afeta os objetivos. Pode ser positivo ou negativo, quantitativo ou qualitativo.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Indicador de Risco</strong></h5>
              <p>Métrica que fornece informações sobre a exposição ao risco ou sobre mudanças no nível de risco.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>ISO 31000</strong></h5>
              <p>Norma internacional que fornece princípios e diretrizes para gestão de riscos aplicáveis a qualquer organização.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Matriz de Risco</strong></h5>
              <p>Ferramenta para classificar e exibir riscos definindo intervalos para probabilidade e impacto.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Mitigação</strong></h5>
              <p>Estratégia de resposta que visa reduzir a probabilidade de ocorrência ou o impacto de um risco.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Monitoramento</strong></h5>
              <p>Verificação, supervisão, observação crítica ou determinação contínua do status de riscos.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Nível de Risco</strong></h5>
              <p>Magnitude de um risco, expressa em termos da combinação de probabilidade e impacto.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Proprietário do Risco</strong></h5>
              <p>Pessoa ou entidade com responsabilidade e autoridade para gerenciar um risco específico.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Probabilidade</strong></h5>
              <p>Chance de algo acontecer. Pode ser expressa qualitativa ou quantitativamente (0-100%).</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Proximidade</strong></h5>
              <p>Indicação de quando um risco pode se materializar. Ex: Imediato, Próximo, Distante.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Registro de Risco</strong></h5>
              <p>Documento usado para capturar e manter informações sobre todos os riscos identificados.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Risco</strong></h5>
              <p>Efeito da incerteza nos objetivos. Pode ser positivo (oportunidade) ou negativo (ameaça).</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Risco Inerente</strong></h5>
              <p>Nível de risco antes da aplicação de controles ou ações de mitigação.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Risco Residual</strong></h5>
              <p>Nível de risco que permanece após a aplicação de controles e ações de mitigação.</p>
            </div>
            
            <div class="bg-blue-50 p-4 rounded">
              <h5><strong>Tolerância a Risco</strong></h5>
              <p>Disposição de uma organização ou stakeholder para aceitar variação após a busca por objetivos de risco.</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded">
              <h5><strong>Tratamento de Risco</strong></h5>
              <p>Processo para modificar o risco através de controles, ações ou mudanças nos processos.</p>
            </div>
          </div>
        `
      }
    ]
  }
];