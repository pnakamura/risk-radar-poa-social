// Utility functions for score normalization and color system

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Normalize score from 0-85 to 0-100 scale
export const normalizeScore = (score: number, maxScore: number = 85): number => {
  return Math.round((score / maxScore) * 100);
};

// Define color ranges for normalized scores (0-100)
export const getScoreRanges = (): ScoreRange[] => [
  {
    min: 0,
    max: 20,
    label: 'Crítico',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    min: 21,
    max: 40,
    label: 'Ruim',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    min: 41,
    max: 60,
    label: 'Regular',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    min: 61,
    max: 80,
    label: 'Bom',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    min: 81,
    max: 100,
    label: 'Excelente',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
];

// Get color information for a normalized score
export const getScoreColor = (normalizedScore: number): ScoreRange => {
  const ranges = getScoreRanges();
  return ranges.find(range => 
    normalizedScore >= range.min && normalizedScore <= range.max
  ) || ranges[0]; // Default to critical if not found
};

// Get semantic color classes using design tokens
export const getSemanticScoreColor = (normalizedScore: number) => {
  if (normalizedScore >= 81) return 'text-risk-excellent bg-risk-excellent-bg border-risk-excellent-border';
  if (normalizedScore >= 61) return 'text-risk-good bg-risk-good-bg border-risk-good-border';
  if (normalizedScore >= 41) return 'text-risk-warning bg-risk-warning-bg border-risk-warning-border';
  return 'text-risk-critical bg-risk-critical-bg border-risk-critical-border';
};

// Get score label for normalized score
export const getScoreLabel = (normalizedScore: number): string => {
  if (normalizedScore >= 81) return 'Excelente';
  if (normalizedScore >= 61) return 'Bom';
  if (normalizedScore >= 41) return 'Regular';
  if (normalizedScore >= 21) return 'Ruim';
  return 'Crítico';
};

// Get trend icon based on score
export const getScoreTrendIcon = (normalizedScore: number): string => {
  if (normalizedScore >= 81) return '📈';
  if (normalizedScore >= 61) return '📊';
  if (normalizedScore >= 41) return '📉';
  return '🚨';
};