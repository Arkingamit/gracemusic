
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Organization } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface OrganizationFormProps {
  organization?: Organization;
  onSuccess?: (organizationId: string) => void;
}

const OrganizationForm = ({ organization, onSuccess }: OrganizationFormProps) => {
  const [name, setName] = useState(organization?.name || '');
  const [description, setDescription] = useState(organization?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createOrganization, updateOrganization } = useOrganizations();
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      router.push('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter an organization name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (organization) {
        // Update existing organization
        await updateOrganization(organization.id, { name, description });
        if (onSuccess) {
          onSuccess(organization.id);
        } else {
          router.push(`/organizations/${organization.id}`);
        }
      } else {
        // Create new organization
        const organizationId = await createOrganization({
          name,
          description,
          members: [currentUser!.id]
        });
        
        if (onSuccess) {
          onSuccess(organizationId);
        } else {
          router.push(`/organizations/${organizationId}`);
        }
      }
    } catch (error) {
      console.error('Error saving organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Organization Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter organization description"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/organizations')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : organization
                ? 'Update Organization'
                : 'Create Organization'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationForm;
