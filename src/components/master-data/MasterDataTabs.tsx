
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileForm from './ProfileForm';
import ProjectForm from './ProjectForm';
import ProfileList from './ProfileList';
import ProjectList from './ProjectList';
import ProfileEditModal from './ProfileEditModal';
import ProjectEditModal from './ProjectEditModal';
import { usePermissions } from '@/hooks/usePermissions';

interface MasterDataTabsProps {
  onSuccess: () => void;
}

const MasterDataTabs = ({ onSuccess }: MasterDataTabsProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { canManageProfiles, canManageProjects } = usePermissions();

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowProfileForm(false);
    setShowProjectForm(false);
    onSuccess();
  };

  const handleEditProfile = (profile: any) => {
    setEditingProfile(profile);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
  };

  const closeEditModals = () => {
    setEditingProfile(null);
    setEditingProject(null);
  };

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

      <TabsContent value="profiles" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Gerenciar Pessoas</h3>
          {canManageProfiles && (
            <Button onClick={() => setShowProfileForm(!showProfileForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              {showProfileForm ? 'Ocultar Formulário' : 'Nova Pessoa'}
            </Button>
          )}
        </div>
        
        {showProfileForm && canManageProfiles && (
          <ProfileForm onSuccess={handleSuccess} />
        )}
        
        <ProfileList 
          onEditProfile={handleEditProfile}
          refreshTrigger={refreshTrigger}
        />
      </TabsContent>

      <TabsContent value="projects" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Gerenciar Projetos</h3>
          {canManageProjects && (
            <Button onClick={() => setShowProjectForm(!showProjectForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              {showProjectForm ? 'Ocultar Formulário' : 'Novo Projeto'}
            </Button>
          )}
        </div>
        
        {showProjectForm && canManageProjects && (
          <ProjectForm onSuccess={handleSuccess} />
        )}
        
        <ProjectList 
          onEditProject={handleEditProject}
          refreshTrigger={refreshTrigger}
        />
      </TabsContent>

      <ProfileEditModal
        isOpen={!!editingProfile}
        onClose={closeEditModals}
        onSuccess={handleSuccess}
        profile={editingProfile}
      />

      <ProjectEditModal
        isOpen={!!editingProject}
        onClose={closeEditModals}
        onSuccess={handleSuccess}
        project={editingProject}
      />
    </Tabs>
  );
};

export default MasterDataTabs;
