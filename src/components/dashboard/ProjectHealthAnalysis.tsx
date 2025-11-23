import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Flame,
  Calendar,
  CalendarClock,
  RefreshCw,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { generateCompleteAnalysis, NarrativeAnalysis } from '@/utils/narrativeAnalysis';
import { useIsMobile } from '@/hooks/use-mobile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface ProjectHealthAnalysisProps {
  risks: Risk[];
  selectedProject?: string;
}

export const ProjectHealthAnalysis = ({ risks, selectedProject }: ProjectHealthAnalysisProps) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  const analysis: NarrativeAnalysis = React.useMemo(() => {
    return generateCompleteAnalysis(risks, selectedProject);
  }, [risks, selectedProject]);

  const scoreColor = React.useMemo(() => {
    const score = parseInt(analysis.scoreExplanation.range.split('-')[0]);
    if (score >= 81) return { bg: 'bg-risk-excellent-bg', text: 'text-risk-excellent', border: 'border-risk-excellent/20' };
    if (score >= 61) return { bg: 'bg-category-compliance-bg', text: 'text-category-compliance', border: 'border-category-compliance/20' };
    if (score >= 41) return { bg: 'bg-risk-warning-bg', text: 'text-risk-warning', border: 'border-risk-warning/20' };
    if (score >= 21) return { bg: 'bg-risk-critical-bg', text: 'text-risk-critical', border: 'border-risk-critical/20' };
    return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' };
  }, [analysis.scoreExplanation.range]);

  const scoreValue = React.useMemo(() => {
    return parseInt(analysis.scoreExplanation.range.split('-')[0]);
  }, [analysis.scoreExplanation.range]);

  if (risks.length === 0) {
    return (
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Bem-vindo ao Sistema de Gestão de Riscos!</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Este projeto ainda não possui riscos mapeados. Comece identificando os principais riscos que podem impactar seus objetivos.
            </p>
          </div>
          <div className="pt-4">
            <Badge variant="secondary" className="gap-2">
              <Target className="w-4 h-4" />
              Próximos Passos: Criar primeiro risco
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/30" />
      
      <CardHeader className="pb-4 space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            Análise da Saúde do Projeto
          </CardTitle>
          
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resumo Executivo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Shield className="w-4 h-4" />
            Resumo Executivo
          </div>
          <p className="text-base leading-relaxed">{analysis.executiveSummary}</p>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            {/* Significado do Score */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Significado do Score
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${scoreColor.bg} ${scoreColor.text} border ${scoreColor.border} text-base px-3 py-1`}>
                    {analysis.scoreExplanation.label}
                  </Badge>
                  <span className="text-2xl font-bold">{scoreValue}/100</span>
                </div>
                
                <Progress value={scoreValue} className="h-2" />
                
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm leading-relaxed">{analysis.scoreExplanation.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium">Faixa:</span> {analysis.scoreExplanation.range} pontos
                  </p>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-sm font-medium text-foreground mb-1">Próximos Passos:</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{analysis.scoreExplanation.implication}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pontos de Atenção */}
            {analysis.criticalIssues.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="w-4 h-4" />
                  Pontos de Atenção Prioritários ({analysis.criticalIssues.length})
                </div>
                
                <div className="space-y-2">
                  {analysis.criticalIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        issue.severity === 'critical' 
                          ? 'bg-risk-critical-bg border-risk-critical/20' 
                          : issue.severity === 'high'
                          ? 'bg-risk-warning-bg border-risk-warning/20'
                          : 'bg-muted/30 border-border/50'
                      }`}
                    >
                      <span className="text-xl shrink-0">{issue.icon}</span>
                      <p className="text-sm leading-relaxed">{issue.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forças Identificadas */}
            {analysis.strengths.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  Forças Identificadas ({analysis.strengths.length})
                </div>
                
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-risk-excellent-bg border border-risk-excellent/20"
                    >
                      <span className="text-xl shrink-0">{strength.icon}</span>
                      <p className="text-sm leading-relaxed">{strength.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações Acionáveis */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="w-4 h-4" />
                Recomendações para Melhorar o Score
              </div>

              {/* Urgente */}
              {analysis.recommendations.urgent.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-risk-critical" />
                    <h4 className="text-sm font-semibold">Urgente (24-48h)</h4>
                  </div>
                  <div className="space-y-1 pl-6">
                    {analysis.recommendations.urgent.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-risk-critical shrink-0">→</span>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curto Prazo */}
              {analysis.recommendations.shortTerm.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-risk-warning" />
                    <h4 className="text-sm font-semibold">Curto Prazo (esta semana)</h4>
                  </div>
                  <div className="space-y-1 pl-6">
                    {analysis.recommendations.shortTerm.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-risk-warning shrink-0">→</span>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Médio Prazo */}
              {analysis.recommendations.mediumTerm.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-category-compliance" />
                    <h4 className="text-sm font-semibold">Médio Prazo (este mês)</h4>
                  </div>
                  <div className="space-y-1 pl-6">
                    {analysis.recommendations.mediumTerm.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-category-compliance shrink-0">→</span>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Melhoria Contínua */}
              {analysis.recommendations.continuous.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Melhoria Contínua</h4>
                  </div>
                  <div className="space-y-1 pl-6">
                    {analysis.recommendations.continuous.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-primary shrink-0">→</span>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
