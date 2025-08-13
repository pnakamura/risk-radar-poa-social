import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpSidebar } from '@/components/help/HelpSidebar';
import { HelpContent } from '@/components/help/HelpContent';
import { HelpSearch } from '@/components/help/HelpSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { helpSections } from '@/components/help/helpData';

const Help = () => {
  const [activeSection, setActiveSection] = useState('welcome');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Central de Ajuda</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HelpSearch query={searchQuery} onQueryChange={setSearchQuery} />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <HelpSidebar
          sections={helpSections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          searchQuery={searchQuery}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
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