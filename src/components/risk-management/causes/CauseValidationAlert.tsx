import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CauseValidationAlertProps {
  issues: string[];
  onResolve?: () => void;
  loading?: boolean;
}

export const CauseValidationAlert = ({ issues, onResolve, loading }: CauseValidationAlertProps) => {
  if (issues.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Inconsistências Detectadas</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Foram encontradas inconsistências nos dados das causas:</p>
        <ul className="list-disc list-inside space-y-1">
          {issues.map((issue, index) => (
            <li key={index} className="text-sm">{issue}</li>
          ))}
        </ul>
        {onResolve && (
          <Button
            size="sm"
            variant="outline"
            onClick={onResolve}
            disabled={loading}
            className="mt-2"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Resolver Inconsistências
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};