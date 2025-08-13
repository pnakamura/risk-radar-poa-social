import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HelpSection } from './helpData';

interface HelpSidebarProps {
  sections: HelpSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  searchQuery: string;
}

export const HelpSidebar = ({ 
  sections, 
  activeSection, 
  onSectionChange, 
  searchQuery 
}: HelpSidebarProps) => {
  const filteredSections = sections.filter(section => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = section.title.toLowerCase().includes(searchLower);
    const subsectionMatch = section.subsections?.some(sub => 
      sub.title.toLowerCase().includes(searchLower) ||
      sub.content.toString().toLowerCase().includes(searchLower)
    );
    
    return titleMatch || subsectionMatch;
  });

  const getIconComponent = (iconName?: string) => {
    // Para simplicidade, vamos usar ícones básicos
    switch (iconName) {
      case 'Home': return '🏠';
      case 'BookOpen': return '📚';
      case 'Settings': return '⚙️';
      case 'PlayCircle': return '▶️';
      case 'HelpCircle': return '❓';
      case 'Book': return '📖';
      default: return '📄';
    }
  };

  return (
    <aside className="w-80 border-r bg-muted/10">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Navegação
        </h2>
        
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Search className="w-4 h-4" />
              <span>Filtrando por: "{searchQuery}"</span>
            </div>
          </div>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="px-4 pb-4 space-y-2">
          {filteredSections.map((section) => (
            <div key={section.id}>
              <Button
                variant={activeSection.startsWith(section.id) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-auto py-3",
                  activeSection.startsWith(section.id) && "bg-secondary"
                )}
                onClick={() => onSectionChange(section.id)}
              >
                <span className="text-lg">
                  {getIconComponent(section.icon)}
                </span>
                <span className="flex-1 text-left">{section.title}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Subsections */}
              {activeSection.startsWith(section.id) && section.subsections && (
                <div className="ml-8 mt-2 space-y-1">
                  {section.subsections.map((subsection) => (
                    <Button
                      key={subsection.id}
                      variant={activeSection === subsection.id ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start text-sm h-auto py-2",
                        activeSection === subsection.id && "bg-secondary"
                      )}
                      onClick={() => onSectionChange(subsection.id)}
                    >
                      <span className="text-left">{subsection.title}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {filteredSections.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum resultado encontrado</p>
              <p className="text-sm">Tente termos diferentes</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};