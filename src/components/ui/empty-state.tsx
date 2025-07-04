
import React from 'react';
import { AlertTriangle, Plus, Users, FolderOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: 'risk' | 'users' | 'projects' | 'general';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const iconMap = {
  risk: AlertTriangle,
  users: Users,
  projects: FolderOpen,
  general: Plus
};

export const EmptyState = ({ 
  icon = 'general', 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) => {
  const Icon = iconMap[icon];

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
