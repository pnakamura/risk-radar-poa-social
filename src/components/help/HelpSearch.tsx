import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HelpSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const HelpSearch = ({ query, onQueryChange }: HelpSearchProps) => {
  return (
    <div className="relative w-full max-w-64">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Buscar ajuda..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-9 pr-9 w-full"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={() => onQueryChange('')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};