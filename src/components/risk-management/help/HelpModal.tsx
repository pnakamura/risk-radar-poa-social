import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Target, Lightbulb } from 'lucide-react';

export interface HelpContent {
  field: string;
  title: string;
  definition: string;
  iso31000Guidelines: string;
  howToFill: string;
  examples: string[];
  criteria: string[];
  relatedFields?: string[];
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: HelpContent;
}

export const HelpModal = ({ isOpen, onClose, content }: HelpModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Ajuda: {content.title}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="definition" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="definition" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Definição
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              ISO 31000
            </TabsTrigger>
            <TabsTrigger value="howto" className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              Como Preencher
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Exemplos
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="definition" className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Conceito Técnico</h3>
                <p className="text-sm leading-relaxed">{content.definition}</p>
              </div>
              
              {content.relatedFields && content.relatedFields.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Campos Relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.relatedFields.map((field, index) => (
                      <Badge key={index} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="guidelines" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Orientações ISO 31000:2018
                </h3>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {content.iso31000Guidelines}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="howto" className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-l-4 border-green-500">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Instruções de Preenchimento
                </h3>
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {content.howToFill}
                </div>
              </div>

              {content.criteria.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Critérios de Qualidade</h3>
                  <ul className="space-y-2">
                    {content.criteria.map((criterion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Exemplos Práticos</h3>
                <div className="space-y-3">
                  {content.examples.map((example, index) => (
                    <div key={index} className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          Exemplo {index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 leading-relaxed">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};