import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark');
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export default ThemeToggle;
