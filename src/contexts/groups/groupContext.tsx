
import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Group, Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth, authFetch } from '@/contexts/AuthContext';
import { GroupContextType } from './types';
import { 
  createGroupActions, 
  createSongActions, 
  createMemberActions, 
  createMessageActions, 
  createQueryActions 
} from './groupActions';

// Create Context
const GroupContext = createContext<GroupContextType | null>(null);

// Provider Component
export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch groups from API
  const refreshGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  // Group management actions
  const { 
    createGroup, 
    getGroup, 
    updateGroup, 
    deleteGroup 
  } = createGroupActions(groups, setGroups, currentUser, toast, setLoading);

  // Song management actions
  const { 
    addSongToGroup, 
    removeSongFromGroup 
  } = createSongActions(groups, setGroups, currentUser, toast, setLoading);

  // Member management actions
  const { 
    addMemberToGroup, 
    removeMemberFromGroup 
  } = createMemberActions(groups, setGroups, currentUser, toast, setLoading);

  // Message management actions
  const { 
    sendMessage, 
    getGroupMessages 
  } = createMessageActions(messages, setMessages, groups, currentUser, toast);

  // Query actions
  const { 
    getOrganizationGroups 
  } = createQueryActions(groups);
  
  // Implement getGroups function
  const getGroups = (filters: { organizationId?: string } = {}) => {
    if (filters && filters.organizationId) {
      return groups.filter(group => group.organizationId === filters.organizationId);
    }
    return groups;
  };

  // Update song transposition via API
  const updateSongTransposition = async (
    groupId: string,
    songId: string,
    transposition: number,
    useFlats: boolean = false
  ) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in');

      const res = await authFetch(`/api/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({
          songTranspositions: groups.find(g => g.id === groupId)?.songTranspositions?.map(t =>
            t.songId === songId ? { ...t, transposition, useFlats } : t
          ) || [{ songId, transposition, useFlats }]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update transposition');

      setGroups(prev => prev.map(g => g.id === groupId ? data.group : g));
      toast({ title: "Song transposition updated", description: `Transposition updated successfully` });
    } catch (error) {
      toast({ title: "Failed to update transposition", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: GroupContextType = {
    groups,
    messages,
    loading,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    addSongToGroup,
    removeSongFromGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    sendMessage,
    getGroupMessages,
    getGroups,
    getOrganizationGroups,
    updateSongTransposition
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export default GroupContext;
