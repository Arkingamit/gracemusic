
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GroupForm from '@/components/GroupForm';
import { useGroups } from '@/contexts/groups';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/lib/types';

const GroupEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getGroup } = useGroups();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | undefined>();

  useEffect(() => {
    if (id) {
      const groupData = getGroup(id);
      setGroup(groupData);
      
      if (!groupData) {
        router.replace('/groups');
        return;
      }
      
      // Check if user has permission to edit
      if (
        currentUser && 
        currentUser.role !== 'admin' && 
        groupData.createdBy !== currentUser.id
      ) {
        router.replace(`/groups/${id}`);
      }
    }
  }, [id, getGroup, router, currentUser]);

  if (!group) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Group</h1>
      <GroupForm 
        group={group} 
        onSuccess={() => router.push(`/groups/${id}`)} 
      />
    </div>
  );
};

export default GroupEdit;
