
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGroups } from '@/contexts/groups';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/lib/types';
import { Building } from 'lucide-react';

const GroupList = () => {
  const { groups, loading, deleteGroup } = useGroups();
  const { organizations, getUserOrganizations } = useOrganizations();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllGroups, setShowAllGroups] = useState(false);
  const router = useRouter();

  // Get user's organizations
  const userOrganizations = getUserOrganizations();
  const userOrgIds = userOrganizations.map(org => org.id);

  // Filter groups based on user's organizations if user is logged in
  // Only show song sets from organizations the user belongs to
  const availableGroups = currentUser
    ? groups.filter(group => 
        userOrgIds.includes(group.organizationId) || 
        group.members.includes(currentUser.id) ||
        group.createdBy === currentUser.id
      )
    : [];

  // Filter groups based on search query
  const filteredGroups = availableGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this song set?')) {
      try {
        await deleteGroup(id);
      } catch (error) {
        console.error('Failed to delete song set:', error);
      }
    }
  };

  const isMember = (group: Group) => {
    if (!currentUser) return false;
    return group.members.includes(currentUser.id);
  };

  const canManage = (group: Group) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || group.createdBy === currentUser.id;
  };

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : "Unknown Organization";
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4 text-muted-foreground">
            Please log in to view song sets.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-3xl">Song Sets</CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <Input
              placeholder="Search song sets..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {currentUser && (
              <Button onClick={() => router.push('/groups/new')}>
                Create Song Set
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading song sets...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery
                ? 'No song sets match your search criteria'
                : userOrganizations.length === 0
                  ? 'You need to join an organization to view song sets. Contact an admin to be added to an organization.'
                  : 'No song sets available in your organizations. Create a song set to get started!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Songs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.description}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span 
                          className="hover:underline cursor-pointer"
                          onClick={() => router.push(`/organizations/${group.organizationId}`)}
                        >
                          {getOrganizationName(group.organizationId)}
                        </span>
                      </TableCell>
                      <TableCell>{group.members.length}</TableCell>
                      <TableCell>{group.songs.length}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/groups/${group.id}`)}
                        >
                          View
                        </Button>
                        {canManage(group) && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/groups/${group.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupList;
