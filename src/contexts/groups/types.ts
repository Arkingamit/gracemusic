
import { Group, GroupInput, GroupUpdateInput, Message, MessageInput } from '@/lib/types';

// Context type definition
export interface GroupContextType {
  groups: Group[];
  messages: Message[];
  loading: boolean;
  createGroup: (group: GroupInput) => Promise<string>;
  getGroup: (id: string) => Group | undefined;
  updateGroup: (id: string, group: GroupUpdateInput) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addSongToGroup: (groupId: string, songId: string) => Promise<void>;
  removeSongFromGroup: (groupId: string, songId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, userId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, userId: string) => Promise<void>;
  sendMessage: (message: MessageInput) => Promise<void>;
  getGroupMessages: (groupId: string) => Message[];
  getGroups: (filters?: { organizationId?: string }) => Group[];
  getOrganizationGroups: (organizationId: string) => Group[];
  updateSongTransposition?: (groupId: string, songId: string, transposition: number, useFlats?: boolean) => Promise<void>;
}
