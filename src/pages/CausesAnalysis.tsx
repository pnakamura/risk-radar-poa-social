import React from 'react';
import { InteractiveCommonCausesAnalysis } from '@/components/risk-management/analysis/InteractiveCommonCausesAnalysis';

const CausesAnalysis: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Análise de Causas Comuns</h1>
        <p className="text-muted-foreground mt-2">
          Identifique padrões e tendências nas causas dos riscos organizacionais
        </p>
      </div>
      
      <InteractiveCommonCausesAnalysis />
    </div>
  );
};

export default CausesAnalysis;