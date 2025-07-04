
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskMatrixHeaderProps {
  filteredRisksCount: number;
  totalRisksCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onExportCSV: () => void;
}

export const RiskMatrixHeader = ({ 
  filteredRisksCount, 
  totalRisksCount, 
  showFilters, 
  onToggleFilters, 
  onExportCSV 
}: RiskMatrixHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-xl font-semibold">Matriz de Riscos</h3>
        <p className="text-sm text-gray-600">
          {filteredRisksCount} de {totalRisksCount} {filteredRisksCount === 1 ? 'risco' : 'riscos'}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
};
