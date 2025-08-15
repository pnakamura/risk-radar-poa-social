import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'admin';
  const isAdminOrGestor = profile?.role === 'admin' || profile?.role === 'gestor';
  const canManageUsers = isAdmin;
  const canManageProfiles = isAdmin;
  const canManageProjects = isAdminOrGestor;
  const canCreateRisks = profile?.role === 'admin' || profile?.role === 'gestor' || profile?.role === 'analista';

  return {
    isAdmin,
    isAdminOrGestor,
    canManageUsers,
    canManageProfiles,
    canManageProjects,
    canCreateRisks,
    profile
  };
};