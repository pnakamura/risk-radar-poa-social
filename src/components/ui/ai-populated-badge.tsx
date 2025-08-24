import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

interface AIPopulatedBadgeProps {
  show: boolean;
}

export function AIPopulatedBadge({ show }: AIPopulatedBadgeProps) {
  if (!show) return null;
  
  return (
    <Badge 
      variant="secondary" 
      className="ml-2 bg-blue-100 text-blue-800 border-blue-200"
    >
      <Bot className="w-3 h-3 mr-1" />
      Preenchido pela IA
    </Badge>
  );
}