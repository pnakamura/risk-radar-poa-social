import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { HelpSection } from './helpData';

interface HelpContentProps {
  activeSection: string;
  sections: HelpSection[];
  searchQuery: string;
}

export const HelpContent = ({ activeSection, sections, searchQuery }: HelpContentProps) => {
  const findContent = () => {
    for (const section of sections) {
      if (activeSection === section.id) {
        return { type: 'section', content: section };
      }
      if (section.subsections) {
        const subsection = section.subsections.find(sub => sub.id === activeSection);
        if (subsection) {
          return { type: 'subsection', content: subsection, parent: section };
        }
      }
    }
    return null;
  };

  const contentData = findContent();

  if (!contentData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Selecione um tópico</h3>
          <p>Escolha um item na navegação lateral para ver o conteúdo</p>
        </div>
      </div>
    );
  }

  const renderSectionOverview = (section: HelpSection) => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{section.title}</h1>
        <p className="text-lg text-muted-foreground">
          Explore os tópicos abaixo para aprender mais sobre {section.title.toLowerCase()}
        </p>
      </div>
      
      {section.subsections && (
        <div className="grid gap-4 md:grid-cols-2">
          {section.subsections.map((subsection) => (
            <Card key={subsection.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{subsection.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {subsection.content.toString().substring(0, 120)}...
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <span>Ler mais</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubsectionContent = (subsection: any, parent: HelpSection) => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{parent.title}</Badge>
        </div>
        <h1 className="text-3xl font-bold mb-4">{subsection.title}</h1>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: subsection.content.toString()
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/•/g, '&bull;')
            }}
          />
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ir para o Sistema
            </Button>
            <Button variant="outline" size="sm">
              Próximo Tópico
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ScrollArea className="flex-1">
      <div className="container max-w-4xl py-8 px-6">
        {contentData.type === 'section' 
          ? renderSectionOverview(contentData.content as HelpSection)
          : renderSubsectionContent(contentData.content, contentData.parent!)
        }
      </div>
    </ScrollArea>
  );
};