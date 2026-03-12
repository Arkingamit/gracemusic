
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useGroups } from '@/contexts/groups';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Group } from '@/lib/types';
import GroupList from './GroupList';
import GroupForm from './GroupForm';
import InviteMemberForm from '@/components/InviteMemberForm';
interface OrganizationDetailProps {
  id: string;
}

const OrganizationDetail: React.FC<OrganizationDetailProps> = ({ id }) => {
  const router = useRouter();
  const {
    getOrganization,
    deleteOrganization,
    addMemberToOrganization,
    removeMemberFromOrganization
  } = useOrganizations();
  const { getGroups } = useGroups();
  const { currentUser } = useAuth();
  const [organization, setOrganization] = useState(id ? getOrganization(id) : undefined);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  useEffect(() => {
    if (id) {
      const org = getOrganization(id);
      setOrganization(org);
      if (org) {
        const groupList = getGroups({ organizationId: id });
        setGroups(groupList);
      }
    }
  }, [id, getOrganization, getGroups]);

  useEffect(() => {
    if (organization && currentUser) {
      setIsMember(organization.members.includes(currentUser.id));
    }
  }, [organization, currentUser]);

  const handleDeleteOrganization = async () => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        if (id) {
          await deleteOrganization(id);
          router.push('/organizations');
        }
      } catch (error) {
        console.error('Failed to delete organization:', error);
      }
    }
  };

  const handleJoinOrganization = async () => {
    if (id && currentUser) {
      try {
        await addMemberToOrganization(id, currentUser.id);
        const updatedOrg = getOrganization(id);
        setOrganization(updatedOrg);
        setIsMember(true);
      } catch (error) {
        console.error('Failed to join organization:', error);
      }
    }
  };

  const handleLeaveOrganization = async () => {
    if (id && currentUser) {
      try {
        await removeMemberFromOrganization(id, currentUser.id);
        const updatedOrg = getOrganization(id);
        setOrganization(updatedOrg);
        setIsMember(false);
      } catch (error) {
        console.error('Failed to leave organization:', error);
      }
    }
  };

  const canManage = () => {
    if (!currentUser || !organization) return false;
    return currentUser.role === 'admin' || organization.createdBy === currentUser.id;
  };

  if (!organization) {
    return <div>Loading organization...</div>;
  }

return (
  <div className="container mx-auto px-4 py-8">
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-gray-600">{organization.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentUser && !isMember && (
              <Button onClick={handleJoinOrganization}>Join Organization</Button>
            )}
            {currentUser && isMember && (
              <Button variant="destructive" onClick={handleLeaveOrganization}>
                Leave Organization
              </Button>
            )}
            {canManage() && (
              <>
                <Button onClick={() => router.push(`/organizations/${id}/edit`)}>
                  Edit Organization
                </Button>
                <Button variant="destructive" onClick={handleDeleteOrganization}>
                  Delete Organization
                </Button>
              </>
            )}
            {currentUser && isMember && (
              <Button onClick={() => setShowGroupForm(true)}>Create Group</Button>
            )}
          </div>
        </div>

        {canManage() && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Invite Members</h2>
            <InviteMemberForm organizationId={id} />
          </div>
        )}

        {showGroupForm && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Create New Group</h2>
            <GroupForm
              organizationId={id}
              members={currentUser ? [currentUser.id] : []}
              onClose={() => setShowGroupForm(false)}
            />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-2">Groups</h2>
          {groups.length > 0 ? (
            <div className="grid gap-4">
              {groups.map(group => (
                <Card key={group.id} className="p-4">
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                  <Button
                    variant="link"
                    onClick={() => router.push(`/groups/${group.id}`)}
                    className="p-0 h-auto mt-2"
                  >
                    View Group
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No groups in this organization yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);
}; 
export default OrganizationDetail;