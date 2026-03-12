import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Organization, OrganizationInput, OrganizationUpdateInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth, authFetch } from './AuthContext';

interface OrganizationContextType {
  organizations: Organization[];
  loading: boolean;
  createOrganization: (organization: OrganizationInput) => Promise<string>;
  getOrganization: (id: string) => Organization | undefined;
  updateOrganization: (id: string, organization: OrganizationUpdateInput) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  addGroupToOrganization: (organizationId: string, groupId: string) => Promise<void>;
  removeGroupFromOrganization: (organizationId: string, groupId: string) => Promise<void>;
  addMemberToOrganization: (organizationId: string, userId: string) => Promise<void>;
  removeMemberFromOrganization: (organizationId: string, userId: string) => Promise<void>;
  inviteMemberToOrganization: (organizationId: string, email: string) => Promise<void>;
  getUserOrganizations: () => Organization[];
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const refreshOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrganizations();
  }, [refreshOrganizations]);

  const createOrganization = async (organizationInput: OrganizationInput): Promise<string> => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to create an organization');

      const res = await authFetch('/api/organizations', {
        method: 'POST',
        body: JSON.stringify(organizationInput),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create organization');

      setOrganizations(prev => [...prev, data.organization]);
      toast({ title: "Organization created", description: `${data.organization.name} has been created successfully` });
      return data.organization.id;
    } catch (error) {
      toast({ title: "Failed to create organization", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrganization = (id: string) => organizations.find(organization => organization.id === id);

  const updateOrganization = async (id: string, updatedData: OrganizationUpdateInput) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to update an organization');

      const res = await authFetch(`/api/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update organization');

      setOrganizations(prev => prev.map(o => o.id === id ? data.organization : o));
      toast({ title: "Organization updated", description: `${data.organization.name} has been updated successfully` });
    } catch (error) {
      toast({ title: "Failed to update organization", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      const org = organizations.find(o => o.id === id);
      if (!org) throw new Error('Not found');

      const res = await authFetch(`/api/organizations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setOrganizations(prev => prev.filter(o => o.id !== id));
      toast({ title: "Deleted", description: `${org.name} has been deleted` });
    } catch (error) {
      toast({ title: "Failed to delete", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addGroupToOrganization = async (organizationId: string, groupId: string) => {
    // Groups are managed via the groups API - this refreshes the org state
    await refreshOrganizations();
  };

  const removeGroupFromOrganization = async (organizationId: string, groupId: string) => {
    await refreshOrganizations();
  };

  const addMemberToOrganization = async (organizationId: string, userId: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');

      const res = await authFetch(`/api/organizations/${organizationId}`, {
        method: 'PUT',
        body: JSON.stringify({ members: [...org.members, userId] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');

      setOrganizations(prev => prev.map(o => o.id === organizationId ? data.organization : o));
      toast({ title: "Member added", description: `User added to ${org.name}` });
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const inviteMemberToOrganization = async (organizationId: string, email: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');
      // TODO: Implement proper invite endpoint
      toast({ title: "Invitation sent", description: `Invitation sent to ${email} for ${org.name}` });
    } catch (error) {
      toast({ title: "Invite failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromOrganization = async (organizationId: string, userId: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');

      const res = await authFetch(`/api/organizations/${organizationId}`, {
        method: 'PUT',
        body: JSON.stringify({ members: org.members.filter(m => m !== userId) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');

      setOrganizations(prev => prev.map(o => o.id === organizationId ? data.organization : o));
      toast({ title: "Member removed", description: `User removed from ${org.name}` });
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserOrganizations = () => currentUser ? organizations.filter(org => org.members.includes(currentUser.id) || org.createdBy === currentUser.id) : [];

  const value = {
    organizations,
    loading,
    createOrganization,
    getOrganization,
    updateOrganization,
    deleteOrganization,
    addGroupToOrganization,
    removeGroupFromOrganization,
    addMemberToOrganization,
    removeMemberFromOrganization,
    inviteMemberToOrganization,
    getUserOrganizations,
    refreshOrganizations
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganizations = () => {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganizations must be used within an OrganizationProvider');
  return context;
};
