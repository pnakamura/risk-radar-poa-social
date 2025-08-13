import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpSidebar } from '@/components/help/HelpSidebar';
import { HelpContent } from '@/components/help/HelpContent';
import { HelpSearch } from '@/components/help/HelpSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { helpSections } from '@/components/help/helpData';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

const Help = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('welcome');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (isMobile) {
      setMobileSearchOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Trigger */}
            {isMobile && (
              <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>Navegação da Ajuda</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex-1 overflow-hidden">
                    <HelpSidebar 
                      sections={helpSections}
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                      searchQuery={searchQuery}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {!isMobile && "Voltar"}
            </Button>
            
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold hidden sm:block">Central de Ajuda</h1>
              <h1 className="text-sm font-semibold sm:hidden">Ajuda</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {isMobile ? (
              <Drawer open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Buscar na Ajuda</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4">
                    <HelpSearch 
                      query={searchQuery}
                      onQueryChange={handleSearchChange}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <HelpSearch query={searchQuery} onQueryChange={setSearchQuery} />
            )}
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <HelpSidebar
            sections={helpSections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            searchQuery={searchQuery}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto min-w-0">
          <HelpContent
            activeSection={activeSection}
            sections={helpSections}
            searchQuery={searchQuery}
            onSectionChange={setActiveSection}
          />
        </main>
      </div>
    </div>
  );
};

export default Help;