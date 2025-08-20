/**
 * Utilities for cause similarity detection and deduplication
 */

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Tokenize text for comparison
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

// Calculate Jaccard similarity for tokenized text
function jaccardSimilarity(tokens1: string[], tokens2: string[]): number {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Main similarity calculation
export function calculateSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  if (text1 === text2) return 1;
  
  // Normalize texts
  const norm1 = text1.trim().toLowerCase();
  const norm2 = text2.trim().toLowerCase();
  
  if (norm1 === norm2) return 1;
  
  // Calculate Levenshtein similarity
  const maxLength = Math.max(norm1.length, norm2.length);
  const levDistance = levenshteinDistance(norm1, norm2);
  const levSimilarity = 1 - (levDistance / maxLength);
  
  // Calculate Jaccard similarity for tokens
  const tokens1 = tokenize(norm1);
  const tokens2 = tokenize(norm2);
  const jaccardSim = jaccardSimilarity(tokens1, tokens2);
  
  // Combined score (weighted average)
  return (levSimilarity * 0.4) + (jaccardSim * 0.6);
}

// Find similar causes
export interface SimilarCause {
  id?: string;
  descricao: string;
  categoria: string | null;
  similarity: number;
  frequency?: number;
}

export function findSimilarCauses(
  inputText: string,
  existingCauses: Array<{ id?: string; descricao: string; categoria: string | null; frequency?: number }>,
  threshold: number = 0.7
): SimilarCause[] {
  if (!inputText.trim()) return [];
  
  return existingCauses
    .map(cause => ({
      ...cause,
      similarity: calculateSimilarity(inputText, cause.descricao)
    }))
    .filter(cause => cause.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5 similar causes
}

// Check if cause is likely duplicate
export function isDuplicateCause(
  inputText: string,
  existingCauses: Array<{ descricao: string }>,
  threshold: number = 0.85
): boolean {
  return existingCauses.some(cause => 
    calculateSimilarity(inputText, cause.descricao) >= threshold
  );
}

// Merge text causes into one (for legacy migration)
export function mergeCauseTexts(causes: string[]): string {
  return [...new Set(causes.filter(Boolean))].join('; ');
}

// Split legacy cause text into individual causes
export function splitLegacyCauses(causesText: string): string[] {
  if (!causesText) return [];
  
  return causesText
    .split(/[;,\n]/)
    .map(cause => cause.trim())
    .filter(cause => cause.length > 0)
    .filter((cause, index, arr) => arr.indexOf(cause) === index); // Remove duplicates
}

// Auto-categorize cause based on keywords
export function suggestCategory(causeText: string): string | null {
  const text = causeText.toLowerCase();
  
  const categoryKeywords = {
    'Tecnologia': ['sistema', 'software', 'hardware', 'rede', 'servidor', 'aplicação', 'database', 'integração', 'api'],
    'Recursos Humanos': ['funcionário', 'equipe', 'treinamento', 'capacitação', 'rotatividade', 'ausência', 'competência'],
    'Financeiro': ['orçamento', 'custo', 'receita', 'lucro', 'investimento', 'fluxo de caixa', 'inadimplência'],
    'Operacional': ['processo', 'operação', 'produção', 'qualidade', 'fornecedor', 'estoque', 'logística'],
    'Compliance': ['regulamentação', 'auditoria', 'conformidade', 'legal', 'norma', 'política'],
    'Estratégico': ['mercado', 'concorrência', 'estratégia', 'planejamento', 'objetivo', 'meta'],
    'Regulatório': ['regulação', 'órgão regulador', 'fiscalização', 'multa', 'sanção', 'licença']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return null;
}