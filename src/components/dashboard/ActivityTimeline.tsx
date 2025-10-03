import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  User, 
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';

type Risk = Database['public']['Tables']['riscos']['Row'] & {
  responsavel?: { nome: string } | null;
  projeto?: { nome: string } | null;
  criador?: { nome: string } | null;
};

interface ActivityTimelineProps {
  risks: Risk[];
  selectedProject?: string;
  loading?: boolean;
}

export const ActivityTimeline = ({ risks, selectedProject, loading }: ActivityTimelineProps) => {
  const generateActivities = () => {
    const activities = [];
    const now = new Date();
    const today = new Date(now);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Riscos próximos do prazo (próximos 30 dias)
    const upcomingDeadlines = risks.filter(risk => {
      if (!risk.prazo) return false;
      const deadline = new Date(risk.prazo);
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    });

    // Riscos críticos que precisam de atenção
    const criticalRisks = risks.filter(r => 
      (r.nivel_risco === 'Crítico' || r.nivel_risco === 'Alto') && 
      r.status !== 'Mitigado'
    );

    // Riscos sem responsável
    const unassignedRisks = risks.filter(r => !r.responsavel_id);

    // Gerar atividades baseadas nos dados reais
    if (upcomingDeadlines.length > 0) {
      activities.push({
        id: 'deadlines',
        type: 'warning',
        icon: Clock,
        title: `${upcomingDeadlines.length} risco(s) próximo(s) do prazo`,
        description: `Prazos nos próximos 30 dias`,
        time: 'Hoje',
        action: 'Revisar prazos',
        link: selectedProject ? `/?tab=matrix&project=${encodeURIComponent(selectedProject)}` : '/?tab=matrix',
        color: 'text-yellow-600 bg-yellow-50'
      });
    }

    if (criticalRisks.length > 0) {
      activities.push({
        id: 'critical',
        type: 'alert',
        icon: AlertTriangle,
        title: `${criticalRisks.length} risco(s) crítico(s) pendente(s)`,
        description: 'Requerem ação imediata',
        time: 'Hoje',
        action: 'Revisar riscos',
        link: selectedProject ? `/?tab=matrix&project=${encodeURIComponent(selectedProject)}&level=Crítico,Alto` : '/?tab=matrix&level=Crítico,Alto',
        color: 'text-red-600 bg-red-50'
      });
    }

    if (unassignedRisks.length > 0) {
      activities.push({
        id: 'unassigned',
        type: 'info',
        icon: User,
        title: `${unassignedRisks.length} risco(s) sem responsável`,
        description: 'Atribuir responsabilidades',
        time: 'Hoje',
        action: 'Atribuir responsáveis',
        link: selectedProject ? `/?tab=matrix&project=${encodeURIComponent(selectedProject)}` : '/?tab=matrix',
        color: 'text-blue-600 bg-blue-50'
      });
    }

    // Atividades positivas
    const mitigatedRisks = risks.filter(r => r.status === 'Mitigado');
    if (mitigatedRisks.length > 0) {
      activities.push({
        id: 'mitigated',
        type: 'success',
        icon: CheckCircle,
        title: `${mitigatedRisks.length} risco(s) mitigado(s)`,
        description: 'Bom trabalho na gestão de riscos!',
        time: 'Esta semana',
        action: 'Ver relatório',
        link: selectedProject ? `/?tab=reports&project=${encodeURIComponent(selectedProject)}` : '/?tab=reports',
        color: 'text-green-600 bg-green-50'
      });
    }

    // Sugestões baseadas no contexto
    if (risks.length === 0) {
      activities.push({
        id: 'start',
        type: 'suggestion',
        icon: Plus,
        title: 'Bem-vindo ao sistema de gestão de riscos',
        description: 'Comece criando seu primeiro risco',
        time: 'Agora',
        action: 'Criar risco',
        link: selectedProject ? `/?tab=form&project=${encodeURIComponent(selectedProject)}` : '/?tab=form',
        color: 'text-purple-600 bg-purple-50'
      });
    } else if (risks.length > 0 && risks.length < 5) {
      activities.push({
        id: 'expand',
        type: 'suggestion',
        icon: TrendingUp,
        title: 'Expandir análise de riscos',
        description: 'Considere mapear riscos adicionais',
        time: 'Sugestão',
        action: 'Adicionar riscos',
        link: selectedProject ? `/?tab=form&project=${encodeURIComponent(selectedProject)}` : '/?tab=form',
        color: 'text-indigo-600 bg-indigo-50'
      });
    }

    // Limitar a 6 atividades para não sobrecarregar
    return activities.slice(0, 6);
  };

  const activities = generateActivities();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Centro de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <Link 
                  key={activity.id} 
                  to={activity.link}
                  className="block focus-ring rounded-lg"
                  aria-label={`${activity.title}: ${activity.description}`}
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full ${activity.color} flex-shrink-0`} aria-hidden="true">
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {activity.time}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-7 text-xs"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {activity.action}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};