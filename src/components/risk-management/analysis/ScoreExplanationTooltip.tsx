import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Zap, TrendingUp, Grid, Target } from 'lucide-react';

interface EnhancedCauseDetail {
  causa_descricao: string;
  frequencia: number;
  categorias: string[];
  riscos_alto_impacto: number;
  riscos_medio_impacto: number;
  riscos_baixo_impacto: number;
  impacto_score: number;
  criticidade_score: number;
  tendencia_score: number;
  complexidade_score: number;
  score_final: number;
  confiabilidade_score: number;
}

interface ScoreExplanationTooltipProps {
  cause: EnhancedCauseDetail;
  children: React.ReactNode;
}

export const ScoreExplanationTooltip: React.FC<ScoreExplanationTooltipProps> = ({ cause, children }) => {
  const getScoreColor = (score: number, max: number = 5) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-orange-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getConfiabilidadeLabel = (score: number) => {
    if (score >= 1.0) return { label: 'Muito Alta', color: 'bg-green-500' };
    if (score >= 0.8) return { label: 'Alta', color: 'bg-blue-500' };
    if (score >= 0.6) return { label: 'Média', color: 'bg-yellow-500' };
    return { label: 'Baixa', color: 'bg-red-500' };
  };

  const confiabilidade = getConfiabilidadeLabel(cause.confiabilidade_score);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4" side="bottom">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Composição do Score</h4>
              <Badge variant="outline" className={`${confiabilidade.color} text-white`}>
                Confiabilidade: {confiabilidade.label}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Score final calculado com base nos seguintes componentes:
            </div>

            <div className="space-y-3">
              {/* Impacto Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-medium">Impacto (35%)</span>
                  </div>
                  <span className="text-xs">{cause.impacto_score.toFixed(1)}/5.0</span>
                </div>
                <Progress 
                  value={(cause.impacto_score / 5) * 100} 
                  className="h-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Baseado na severidade dos riscos afetados
                </div>
              </div>

              {/* Criticidade Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-medium">Criticidade (30%)</span>
                  </div>
                  <span className="text-xs">{cause.criticidade_score.toFixed(1)}/25.0</span>
                </div>
                <Progress 
                  value={(cause.criticidade_score / 25) * 100} 
                  className="h-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Média da probabilidade × impacto dos riscos
                </div>
              </div>

              {/* Frequência */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Grid className="h-3 w-3 text-blue-500" />
                    <span className="text-xs font-medium">Frequência (25%)</span>
                  </div>
                  <span className="text-xs">{cause.frequencia} ocorrências</span>
                </div>
                <Progress 
                  value={Math.min(100, (cause.frequencia / 10) * 100)} 
                  className="h-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Normalizada em relação à causa mais frequente
                </div>
              </div>

              {/* Tendência Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-purple-500" />
                    <span className="text-xs font-medium">Tendência (5%)</span>
                  </div>
                  <span className="text-xs">{cause.tendencia_score.toFixed(1)}/3.0</span>
                </div>
                <Progress 
                  value={(cause.tendencia_score / 3) * 100} 
                  className="h-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {cause.tendencia_score > 1.5 ? 'Crescente' : cause.tendencia_score > 1 ? 'Estável' : 'Decrescente'}
                </div>
              </div>

              {/* Complexidade Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium">Complexidade (5%)</span>
                  </div>
                  <span className="text-xs">{cause.complexidade_score.toFixed(1)}/2.0</span>
                </div>
                <Progress 
                  value={(cause.complexidade_score / 2) * 100} 
                  className="h-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {cause.categorias.length} {cause.categorias.length === 1 ? 'categoria afetada' : 'categorias afetadas'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Score Final</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getScoreColor(cause.score_final, 10)}`}></div>
                  <span className="text-sm font-bold">{cause.score_final.toFixed(2)}/10.0</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};