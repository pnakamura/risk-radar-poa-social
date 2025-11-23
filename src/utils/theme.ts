// Utility to resolve design system CSS tokens (HSL values) to usable color strings in JS
// Ensures charts receive concrete colors (e.g., "hsl(210 40% 50%)") which export reliably to images
export function getHsl(tokenName: string): string {
  if (typeof window === 'undefined') return '';
  const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  // If token is already a valid color or empty, fallback gracefully
  if (!value) return '';
  return `hsl(${value})`;
}

export function getChartPalette() {
  return {
    primary: getHsl('--primary'),
    foreground: getHsl('--foreground'),
    muted: getHsl('--muted-foreground'),
    border: getHsl('--border'),
    // Risk level colors
    critical: getHsl('--risk-critical'),
    warning: getHsl('--risk-warning'),
    good: getHsl('--risk-good'),
    excellent: getHsl('--risk-excellent'),
    // Category colors
    strategic: getHsl('--category-strategic'),
    operational: getHsl('--category-operational'),
    financial: getHsl('--category-financial'),
    compliance: getHsl('--category-compliance'),
    regulatory: getHsl('--category-regulatory'),
  } as const;
}

// Map category names to their color tokens
export function getCategoryColor(category: string): string {
  const palette = getChartPalette();
  const categoryMap: Record<string, string> = {
    'Estratégico': palette.strategic,
    'Operacional': palette.operational,
    'Financeiro': palette.financial,
    'Compliance': palette.compliance,
    'Regulatório': palette.regulatory,
    'Tecnologia': palette.primary, // fallback to primary for unmapped categories
    'Recursos Humanos': palette.good,
  };
  return categoryMap[category] || palette.primary;
}
