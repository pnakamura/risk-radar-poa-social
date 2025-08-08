import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpModal, HelpContent } from './HelpModal';

interface FieldHelpButtonProps {
  field: string;
  content: HelpContent;
  className?: string;
}

export const FieldHelpButton = ({ field, content, className }: FieldHelpButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-6 w-6 p-0 text-muted-foreground hover:text-primary ${className}`}
        onClick={() => setIsModalOpen(true)}
        title={`Ajuda para ${content.title}`}
        aria-label={`Abrir ajuda: ${content.title}`}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      
      <HelpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={content}
      />
    </>
  );
};