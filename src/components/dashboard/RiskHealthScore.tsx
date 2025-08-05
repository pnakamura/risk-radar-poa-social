import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Award, Target } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface RiskHealthScoreProps {
  risks: Risk[];
}

export const RiskHealthScore = ({ risks }: RiskHealthScoreProps) => {
  // Calcular score de saúde (0-100)
  const calculateHealthScore = () => {
    if (risks.length === 0) return 85; // Score inicial para sistema vazio
    
    const totalRisks = risks.length;
    const criticalRisks = risks.filter(r => r.nivel_risco === 'Crítico').length;
    const highRisks = risks.filter(r => r.nivel_risco === 'Alto').length;
    const mitigatedRisks = risks.filter(r => r.status === 'Mitigado').length;
    const assignedRisks = risks.filter(r => r.responsavel_id).length;
    const withDeadlines = risks.filter(r => r.prazo).length;
    
    // Fórmula de cálculo do score
    let score = 100;
    
    // Penalidades
    score -= (criticalRisks / totalRisks) * 40; // Riscos críticos pesam muito
    score -= (highRisks / totalRisks) * 20; // Riscos altos pesam moderadamente
    score -= ((totalRisks - assignedRisks) / totalRisks) * 15; // Riscos sem responsável
    score -= ((totalRisks - withDeadlines) / totalRisks) * 10; // Riscos sem prazo
    
    // Bônus
    score += (mitigatedRisks / totalRisks) * 15; // Riscos mitigados são positivos
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    return 'Requer Atenção';
  };

  const getBadges = () => {
    const badges = [];
    const mitigatedRisks = risks.filter(r => r.status === 'Mitigado').length;
    const assignedRisks = risks.filter(r => r.responsavel_id).length;
    
    if (mitigatedRisks > 5) {
      badges.push({ icon: Award, text: 'Mitigação Ativa', color: 'bg-green-100 text-green-700' });
    }
    
    if (assignedRisks === risks.length && risks.length > 0) {
      badges.push({ icon: Target, text: 'Todos Atribuídos', color: 'bg-blue-100 text-blue-700' });
    }

    if (risks.filter(r => r.nivel_risco === 'Crítico').length === 0) {
      badges.push({ icon: Award, text: 'Zero Críticos', color: 'bg-purple-100 text-purple-700' });
    }
    
    return badges;
  };

  return (
    <Card className={`border-2 ${getScoreColor(healthScore)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold">Risk Health Score</span>
          {getScoreIcon(healthScore)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score principal */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{healthScore}</div>
          <div className="text-sm font-medium text-muted-foreground mb-3">
            {getScoreLabel(healthScore)}
          </div>
          <Progress value={healthScore} className="h-3" />
        </div>

        {/* Métricas resumidas */}
        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          <div>
            <div className="font-semibold">{risks.filter(r => r.status === 'Mitigado').length}</div>
            <div className="text-muted-foreground">Mitigados</div>
          </div>
          <div>
            <div className="font-semibold">{risks.filter(r => r.responsavel_id).length}/{risks.length}</div>
            <div className="text-muted-foreground">Atribuídos</div>
          </div>
        </div>

        {/* Badges de conquistas */}
        {getBadges().length > 0 && (
          <div className="flex flex-wrap gap-1">
            {getBadges().map((badge, index) => {
              const Icon = badge.icon;
              return (
                <Badge key={index} variant="secondary" className={`text-xs ${badge.color}`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {badge.text}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Dicas para melhorar */}
        {healthScore < 80 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 Para melhorar: {healthScore < 60 ? 'Migre riscos críticos e atribua responsáveis' : 'Continue mitigando riscos e monitore prazos'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};