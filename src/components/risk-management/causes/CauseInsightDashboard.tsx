import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCausesData } from '@/hooks/useCausesData';
import { CauseValidationAlert } from './CauseValidationAlert';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Activity,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const CauseInsightDashboard = () => {
  const { commonCauses, loading, refreshData } = useCausesData();
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const insights = useMemo(() => {
    if (!commonCauses || commonCauses.length === 0) return null;

    const topCauses = commonCauses.slice(0, 5);
    const trendingCauses = commonCauses
      .filter(c => c.tendencia_score > 1.5)
      .slice(0, 3);
    
    const criticalCauses = commonCauses
      .filter(c => c.criticidade_score > 15)
      .slice(0, 3);

    const systemicCauses = commonCauses
      .filter(c => c.complexidade_score > 1)
      .slice(0, 3);

    return {
      topCauses,
      trendingCauses,
      criticalCauses,
      systemicCauses,
      totalCauses: commonCauses.length,
      avgScore: commonCauses.reduce((sum, c) => sum + c.score_final, 0) / commonCauses.length
    };
  }, [commonCauses]);

  const validateSystemConsistency = async () => {
    setIsValidating(true);
    const issues: string[] = [];

    try {
      // Simulação de validações (em implementação real, fazer consultas ao DB)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (insights) {
        if (insights.totalCauses < 5) {
          issues.push("Poucos dados para análise confiável (< 5 causas)");
        }
        
        if (insights.avgScore < 2) {
          issues.push("Score médio muito baixo - possível problema nos dados");
        }

        const lowConfidenceCauses = commonCauses.filter(c => c.confiabilidade_score < 0.6);
        if (lowConfidenceCauses.length > 0) {
          issues.push(`${lowConfidenceCauses.length} causas com baixa confiabilidade detectadas`);
        }
      }

      setValidationIssues(issues);
    } catch (error) {
      issues.push("Erro ao validar consistência do sistema");
      setValidationIssues(issues);
    } finally {
      setIsValidating(false);
    }
  };

  const resolveInconsistencies = async () => {
    setIsValidating(true);
    try {
      await refreshData(true);
      await validateSystemConsistency();
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-32 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-24 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Nenhum dado de causas encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Validation Alert */}
      <CauseValidationAlert 
        issues={validationIssues}
        onResolve={resolveInconsistencies}
        loading={isValidating}
      />

      {/* System Health Check */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Status do Sistema de Causas</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={validateSystemConsistency}
                disabled={isValidating}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isValidating ? 'animate-spin' : ''}`} />
                Validar Consistência
              </Button>
              {validationIssues.length === 0 && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total de Causas:</span>
              <div className="text-lg font-bold text-primary">{insights.totalCauses}</div>
            </div>
            <div>
              <span className="font-medium">Score Médio:</span>
              <div className="text-lg font-bold">{insights.avgScore.toFixed(1)}</div>
            </div>
            <div>
              <span className="font-medium">Críticas:</span>
              <div className="text-lg font-bold text-destructive">{insights.criticalCauses.length}</div>
            </div>
            <div>
              <span className="font-medium">Em Tendência:</span>
              <div className="text-lg font-bold text-warning">{insights.trendingCauses.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Causes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Top 5 Causas Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.topCauses.map((cause, index) => (
              <div key={cause.causa_descricao} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm truncate">{cause.causa_descricao}</div>
                  <div className="text-xs text-muted-foreground">
                    {cause.frequencia} ocorrências
                  </div>
                </div>
                <Badge variant={index === 0 ? "destructive" : index < 3 ? "default" : "secondary"}>
                  {cause.score_final.toFixed(1)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending Causes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Causas em Tendência de Alta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.trendingCauses.length > 0 ? (
              insights.trendingCauses.map((cause) => (
                <div key={cause.causa_descricao} className="flex items-center justify-between p-2 bg-warning/10 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{cause.causa_descricao}</div>
                    <div className="text-xs text-muted-foreground">
                      Tendência: {cause.tendencia_score.toFixed(1)}x
                    </div>
                  </div>
                  <Badge variant="outline">
                    {cause.frequencia}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tendência significativa detectada</p>
            )}
          </CardContent>
        </Card>

        {/* Critical Causes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Causas de Alta Criticidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.criticalCauses.length > 0 ? (
              insights.criticalCauses.map((cause) => (
                <div key={cause.causa_descricao} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{cause.causa_descricao}</div>
                    <div className="text-xs text-muted-foreground">
                      Criticidade: {cause.criticidade_score.toFixed(1)}
                    </div>
                  </div>
                  <Badge variant="destructive">
                    Alto Risco
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma causa crítica identificada</p>
            )}
          </CardContent>
        </Card>

        {/* Systemic Causes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Causas Sistêmicas Complexas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.systemicCauses.length > 0 ? (
              insights.systemicCauses.map((cause) => (
                <div key={cause.causa_descricao} className="flex items-center justify-between p-2 bg-primary/10 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm truncate">{cause.causa_descricao}</div>
                    <div className="text-xs text-muted-foreground">
                      {cause.categorias.length} categorias afetadas
                    </div>
                  </div>
                  <Badge variant="outline">
                    Sistêmica
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma causa sistêmica detectada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};