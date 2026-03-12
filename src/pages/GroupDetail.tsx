import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroups } from '@/contexts/groups';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GroupSongList from '@/components/GroupSongList';
import GroupChat from '@/components/GroupChat';
import AddSongsToGroup from '@/components/AddSongsToGroup';
import { Plus, Building, FileText } from 'lucide-react';
import { useSongs } from '@/contexts/SongContext';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getGroup } = useGroups();
  const { getAllSongs } = useSongs();
  const { getOrganization } = useOrganizations();
  const { currentUser } = useAuth();
  const [group, setGroup] = useState<Group | undefined>();
  const [showAddSongs, setShowAddSongs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const groupData = getGroup(id);
      setGroup(groupData);
      if (!groupData) {
        router.replace('/groups');
      }
    }
  }, [id, getGroup, router]);

  if (!group) return null;

  const organization = getOrganization(group.organizationId);
  const isMember = currentUser && group.members.includes(currentUser.id);
  const isOwner = currentUser && group.createdBy === currentUser.id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canManage = isOwner || isAdmin;

const handleExportPdf = async () => {
  const { generateSongPdf } = await import('@/lib/pdfUtils');
  const allSongs = getAllSongs();

  const songs = allSongs
    .filter(song => group.songs.includes(song.id))
    .map(song => {
      const transpositionEntry = group.songTranspositions?.find(t => t.songId === song.id);
      return {
        ...song,
        transposition: transpositionEntry?.transposition || 0,
        useFlats: transpositionEntry?.useFlats || false,
      };
    });

  generateSongPdf(
    songs,
    {
      showChords: true,
      transposition: 0,
      useFlats: false,
      fontSize: 12
    },
    group.name
  );
};


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Building className="h-4 w-4" />
            <span className="hover:underline cursor-pointer" onClick={() => router.push(`/organizations/${group.organizationId}`)}>
              {organization?.name || "Organization"}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{group.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => router.push('/groups')}>Back to Groups</Button>
          {canManage && (
            <Button variant="outline" onClick={() => router.push(`/groups/${id}/edit`)}>Edit Group</Button>
          )}
        </div>
      </div>

      {showAddSongs ? (
        <AddSongsToGroup
          groupId={group.id}
          existingSongIds={group.songs}
          onCancel={() => setShowAddSongs(false)}
        />
      ) : (
        <Tabs defaultValue="songs" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="chat">Group Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="songs" className="mt-0">
            {isMember ? (
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setShowAddSongs(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Songs
                  </Button>

                  {group.songs.length > 0 && (
                    <Button onClick={handleExportPdf} variant="outline" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Export PDF
                    </Button>
                  )}
                </div>
                <GroupSongList 
                  groupId={group.id} 
                  groupSongIds={group.songs}
                  groupName={group.name} 
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Members Only</CardTitle>
                  <CardDescription>
                    You need to be a member of this group to view the songs.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            {isMember ? (
              <Card>
                <CardHeader>
                  <CardTitle>Group Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <GroupChat groupId={group.id} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Members Only</CardTitle>
                  <CardDescription>
                    You need to be a member of this group to participate in the chat.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GroupDetail;
