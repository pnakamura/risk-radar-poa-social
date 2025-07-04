
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FolderOpen } from 'lucide-react';
import ProfileForm from './ProfileForm';
import ProjectForm from './ProjectForm';

interface MasterDataTabsProps {
  onSuccess: () => void;
}

const MasterDataTabs = ({ onSuccess }: MasterDataTabsProps) => {
  return (
    <Tabs defaultValue="profiles" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profiles" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Pessoas
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Projetos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profiles">
        <ProfileForm onSuccess={onSuccess} />
      </TabsContent>

      <TabsContent value="projects">
        <ProjectForm onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
};

export default MasterDataTabs;
