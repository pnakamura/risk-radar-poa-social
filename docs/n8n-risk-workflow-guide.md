# Guia de Implementação - Workflow N8N para Processamento de Riscos

## Visão Geral
Este workflow recebe dados da aplicação, processa com IA (OpenAI), e registra automaticamente no Supabase.

## 1. Configuração do Webhook Trigger

### Node: Webhook
```json
{
  "httpMethod": "POST",
  "path": "webhook/d695f3b9-1889-4277-a4e2-289851d9564f",
  "responseMode": "onReceived"
}
```

## 2. Node: Function - Processar Input

```javascript
// Processar diferentes tipos de input recebidos
const inputData = $input.all()[0].json;

let contentToProcess = '';
let inputType = inputData.type || 'text';

if (inputType === 'text') {
  contentToProcess = inputData.content || inputData.text || '';
} else if (inputType === 'audio') {
  // Para áudio, precisará de um node separado para transcrição
  contentToProcess = inputData.content || inputData.audio || '';
} else if (inputType === 'file') {
  // Para arquivos, precisará de processamento específico
  contentToProcess = inputData.content || inputData.file || '';
}

return {
  contentToProcess,
  inputType,
  userId: inputData.userId,
  originalData: inputData
};
```

## 3. Node: OpenAI - Análise de Risco

### Configuração do Chat Model
- **Model**: gpt-4o ou gpt-5-2025-08-07
- **Max Tokens**: 2000
- **Temperature**: 0.3

### System Prompt
```
Você é um especialista em análise de riscos corporativos. Analise o conteúdo fornecido e extraia informações estruturadas sobre riscos identificados.

IMPORTANTE: Sempre responda em formato JSON válido, seguindo exatamente esta estrutura:

{
  "risks": [
    {
      "codigo": "string (será gerado automaticamente)",
      "descricao_risco": "string (obrigatório)",
      "categoria": "Operacional|Financeiro|Estratégico|Compliance|Tecnológico|Ambiental|Reputacional",
      "probabilidade": "Muito Baixa|Baixa|Média|Alta|Muito Alta",
      "impacto": "Muito Baixo|Baixo|Médio|Alto|Muito Alto", 
      "causas": "string (opcional)",
      "consequencias": "string (opcional)",
      "estrategia": "Aceitar|Mitigar|Transferir|Evitar",
      "acoes_mitigacao": "string (opcional)",
      "acoes_contingencia": "string (opcional)",
      "observacoes": "string (opcional)",
      "projeto_id": null,
      "responsavel_id": null,
      "prazo": null
    }
  ]
}

REGRAS PARA ANÁLISE:
1. Identifique todos os riscos mencionados no texto
2. Para cada risco, determine categoria, probabilidade e impacto
3. Sugira estratégias baseadas na criticidade:
   - Crítico/Alto: Mitigar ou Evitar
   - Médio: Mitigar ou Transferir  
   - Baixo: Aceitar ou Mitigar
4. Seja específico nas descrições
5. Se houver informações insuficientes, use valores padrão sensatos

MATRIZ DE RISCO (Probabilidade x Impacto):
- 1-3: Baixo
- 4-8: Médio  
- 9-15: Alto
- 16-25: Crítico
```

### User Prompt Template
```
Analise o seguinte conteúdo e identifique riscos:

CONTEÚDO:
{{ $('Processar Input').item.json.contentToProcess }}

CONTEXTO ADICIONAL:
- Tipo de input: {{ $('Processar Input').item.json.inputType }}
- Data de análise: {{ new Date().toISOString().split('T')[0] }}

Retorne APENAS o JSON com os riscos identificados.
```

## 4. Node: Function - Validar e Calcular

```javascript
// Processar resposta da OpenAI e calcular campos adicionais
const openAIResponse = $input.all()[0].json;
const userId = $('Processar Input').item.json.userId;

// Parse da resposta JSON
let risks;
try {
  risks = typeof openAIResponse.message === 'string' 
    ? JSON.parse(openAIResponse.message) 
    : openAIResponse.message;
} catch (error) {
  return { error: 'Resposta da IA não é um JSON válido', rawResponse: openAIResponse };
}

// Função para calcular nível de risco
function calculateRiskLevel(probabilidade, impacto) {
  const probMap = { 'Muito Baixa': 1, 'Baixa': 2, 'Média': 3, 'Alta': 4, 'Muito Alta': 5 };
  const impactMap = { 'Muito Baixo': 1, 'Baixo': 2, 'Médio': 3, 'Alto': 4, 'Muito Alto': 5 };
  
  const score = probMap[probabilidade] * impactMap[impacto];
  
  if (score >= 16) return 'Crítico';
  if (score >= 9) return 'Alto';
  if (score >= 4) return 'Médio';
  return 'Baixo';
}

// Função para gerar código único
function generateRiskCode(index) {
  const timestamp = Date.now().toString().slice(-6);
  return `RISK-${timestamp}-${String(index + 1).padStart(3, '0')}`;
}

// Processar cada risco
const processedRisks = risks.risks?.map((risk, index) => ({
  ...risk,
  codigo: generateRiskCode(index),
  nivel_risco: calculateRiskLevel(risk.probabilidade, risk.impacto),
  status: 'Identificado',
  data_identificacao: new Date().toISOString().split('T')[0],
  criado_por: userId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
})) || [];

return {
  risks: processedRisks,
  totalRisks: processedRisks.length,
  processedAt: new Date().toISOString()
};
```

## 5. Node: Supabase - Inserir Riscos

### Configuração
- **Operation**: Insert
- **Table**: riscos
- **Columns**: Todos os campos mapeados

### Expression para cada campo:
```javascript
// Código
{{ $node["Validar e Calcular"].json["risks"][0]["codigo"] }}

// Descrição do Risco
{{ $node["Validar e Calcular"].json["risks"][0]["descricao_risco"] }}

// Categoria
{{ $node["Validar e Calcular"].json["risks"][0]["categoria"] }}

// Probabilidade
{{ $node["Validar e Calcular"].json["risks"][0]["probabilidade"] }}

// Impacto
{{ $node["Validar e Calcular"].json["risks"][0]["impacto"] }}

// Nível do Risco
{{ $node["Validar e Calcular"].json["risks"][0]["nivel_risco"] }}

// Status
{{ $node["Validar e Calcular"].json["risks"][0]["status"] }}

// Data de Identificação
{{ $node["Validar e Calcular"].json["risks"][0]["data_identificacao"] }}

// Criado Por
{{ $node["Validar e Calcular"].json["risks"][0]["criado_por"] }}

// Causas
{{ $node["Validar e Calcular"].json["risks"][0]["causas"] }}

// Consequências
{{ $node["Validar e Calcular"].json["risks"][0]["consequencias"] }}

// Estratégia
{{ $node["Validar e Calcular"].json["risks"][0]["estrategia"] }}

// Ações de Mitigação
{{ $node["Validar e Calcular"].json["risks"][0]["acoes_mitigacao"] }}

// Ações de Contingência
{{ $node["Validar e Calcular"].json["risks"][0]["acoes_contingencia"] }}

// Observações
{{ $node["Validar e Calcular"].json["risks"][0]["observacoes"] }}
```

## 6. Node: Function - Resposta Final

```javascript
// Preparar resposta para a aplicação
const risks = $('Validar e Calcular').item.json.risks;
const supabaseResult = $input.all()[0].json;

const response = {
  success: true,
  message: `${risks.length} risco(s) processado(s) com sucesso`,
  data: {
    risksCreated: risks.length,
    risks: risks.map(r => ({
      codigo: r.codigo,
      descricao_risco: r.descricao_risco,
      nivel_risco: r.nivel_risco,
      categoria: r.categoria
    }))
  },
  processedAt: new Date().toISOString()
};

return response;
```

## 7. Configuração de Erro

### Node: Function - Tratamento de Erro
```javascript
const error = $input.all()[0].json;

return {
  success: false,
  error: 'Erro no processamento do risco',
  details: error.message || 'Erro desconhecido',
  timestamp: new Date().toISOString()
};
```

## 8. Configuração do Supabase

### Credenciais necessárias:
- **URL**: https://dvqnlnxkwcrxbctujajl.supabase.co
- **Service Key**: [Chave de serviço do Supabase]

### Headers obrigatórios:
```json
{
  "apikey": "[SUPABASE_ANON_KEY]",
  "Authorization": "Bearer [SUPABASE_SERVICE_KEY]",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
}
```

## 9. Fluxo de Execução

1. **Webhook** → recebe dados da aplicação
2. **Processar Input** → identifica tipo e extrai conteúdo
3. **OpenAI** → analisa conteúdo e extrai riscos estruturados
4. **Validar e Calcular** → processa resposta IA e calcula campos
5. **Supabase Insert** → registra riscos na base de dados
6. **Resposta Final** → retorna status para aplicação

## 10. Tratamento de Múltiplos Riscos

Para processar múltiplos riscos identificados, configure um **Split In Batches** antes do Supabase Insert com:
- **Batch Size**: 1
- **Input Data**: `{{ $node["Validar e Calcular"].json["risks"] }}`

## 11. Logs e Monitoramento

Adicione logs em cada etapa crítica:
```javascript
console.log('Etapa X processada:', JSON.stringify(data, null, 2));
```

## 12. Teste do Workflow

Para testar, envie POST para o webhook com:
```json
{
  "type": "text",
  "content": "Identificamos um risco operacional de falha no sistema de backup que pode causar perda de dados. A probabilidade é alta e o impacto é muito alto.",
  "userId": "uuid-do-usuario"
}
```

---

**Configurações Importantes:**
- Timeout dos nodes: 30 segundos
- Retry automático: 3 tentativas
- Queue mode: Ativado para múltiplos requests
- Error workflow: Configurado para logs