import React from 'react';
import { CommonCausesAnalysis } from '@/components/risk-management/analysis/CommonCausesAnalysis';

const CausesAnalysis: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Análise de Causas Comuns</h1>
        <p className="text-muted-foreground mt-2">
          Identifique padrões e tendências nas causas dos riscos organizacionais
        </p>
      </div>
      
      <CommonCausesAnalysis />
    </div>
  );
};

export default CausesAnalysis;