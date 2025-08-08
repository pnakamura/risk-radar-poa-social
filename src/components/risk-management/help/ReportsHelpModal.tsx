import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface ReportsHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportsHelpModal: React.FC<ReportsHelpModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajuda dos Relatórios de Riscos</DialogTitle>
          <DialogDescription>
            Guia rápido e didático para entender filtros, gráficos e exportação. Ideal para quem não é especialista em análise de riscos.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visao-geral" className="mt-2">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="filtros">Filtros</TabsTrigger>
            <TabsTrigger value="tendencias">Tendências</TabsTrigger>
            <TabsTrigger value="exportacao">Exportação</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Nesta página você encontra três visões: Visão Geral (distribuições por nível, categoria e status), Tendências (evolução mensal), e Detalhado (lista de riscos).
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><b>Riscos por Nível:</b> mostra quantos riscos são Críticos, Altos, Médios e Baixos. Útil para priorização.</li>
              <li><b>Riscos por Categoria:</b> ajuda a identificar áreas com maior concentração de riscos.</li>
              <li><b>Riscos por Status:</b> indica o andamento (ex.: Identificado, Em Mitigação, Mitigado).</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Dica: passe o mouse sobre os gráficos para ver os valores. Você pode aplicar filtros para focar no que importa.
            </p>
          </TabsContent>

          <TabsContent value="filtros" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use os filtros no topo para reduzir os dados exibidos:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li><b>Período:</b> selecione datas específicas ou atalhos (3/6/12 meses, Ano Corrente). O período filtra pela data de identificação.</li>
              <li><b>Projeto e Categoria:</b> foque em um projeto ou categoria de risco.</li>
              <li><b>Nível:</b> escolha faixas (ex.: Crítico + Alto) para priorização.</li>
              <li><b>Status:</b> visualize apenas riscos em um determinado estágio.</li>
              <li><b>Tipo de Relatório:</b> alterne entre Visão Geral, Tendências e Detalhado.</li>
            </ol>
            <p className="text-sm text-muted-foreground">Após aplicar, os cards e gráficos serão atualizados automaticamente.</p>
          </TabsContent>

          <TabsContent value="tendencias" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A visão de Tendências mostra mês a mês quantos riscos foram identificados e sua composição por nível.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><b>Total:</b> linha principal com o número de riscos por mês.</li>
              <li><b>Média móvel (3m):</b> suaviza oscilações e evidencia a direção geral.</li>
              <li><b>Cumulativo:</b> soma acumulada ao longo dos meses.</li>
              <li><b>Barras empilhadas:</b> mostram a divisão entre Crítico+Alto, Médio e Baixo por mês.</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Interpretação prática: picos indicam meses com mais registros; se a média móvel sobe, atenção para tendência de aumento.
            </p>
          </TabsContent>

          <TabsContent value="exportacao" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Clique em “Exportar Dados” para gerar arquivos dos dados ou do relatório visual.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><b>CSV/Excel:</b> planilhas com campos selecionáveis para análise no Excel/Sheets.</li>
              <li><b>JSON:</b> formato técnico para integrações.</li>
              <li><b>HTML/PDF/PNG (Visual):</b> captura fiel do que aparece na tela, com cores e linhas.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">Dica: os filtros aplicados também podem ser incluídos nos metadados.</p>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">1) Por que minha exportação visual não mostrava as linhas?</p>
                <p className="text-muted-foreground">Ajustamos o sistema para usar cores do tema diretamente nos gráficos, garantindo que linhas e eixos apareçam corretamente nas imagens.</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium">2) Como garantir que estou vendo apenas meu projeto?</p>
                <p className="text-muted-foreground">Use o filtro “Projeto” e selecione o desejado. Todos os gráficos e listagens serão atualizados.</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium">3) Qual visão devo usar para apresentar à diretoria?</p>
                <p className="text-muted-foreground">Use “Visão Geral” para panorama e “Tendências” para evolução mensal. Exporte em PDF visual para apresentação.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
