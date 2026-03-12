
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrganizationForm from '@/components/OrganizationForm';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Organization } from '@/lib/types';

const OrganizationEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrganization } = useOrganizations();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | undefined>();

  useEffect(() => {
    if (id) {
      const organizationData = getOrganization(id);
      setOrganization(organizationData);
      
      if (!organizationData) {
        router.replace('/organizations');
        return;
      }
      
      // Check if user has permission to edit
      if (
        currentUser && 
        currentUser.role !== 'admin' && 
        organizationData.createdBy !== currentUser.id
      ) {
        router.replace(`/organizations/${id}`);
      }
    }
  }, [id, getOrganization, router, currentUser]);

  if (!organization) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Organization</h1>
      <OrganizationForm 
        organization={organization} 
        onSuccess={() => router.push(`/organizations/${id}`)} 
      />
    </div>
  );
};

export default OrganizationEdit;
