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
    critical: getHsl('--risk-critical'),
    warning: getHsl('--risk-warning'),
    good: getHsl('--risk-good'),
    excellent: getHsl('--risk-excellent'),
  } as const;
}
