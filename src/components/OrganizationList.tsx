
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
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Organization } from '@/lib/types';
import { Building } from 'lucide-react';

const OrganizationList = () => {
  const { organizations, loading, deleteOrganization } = useOrganizations();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(organization =>
    organization.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    organization.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteOrganization = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id);
      } catch (error) {
        console.error('Failed to delete organization:', error);
      }
    }
  };

  const isMember = (organization: Organization) => {
    if (!currentUser) return false;
    return organization.members.includes(currentUser.id);
  };

  const canManage = (organization: Organization) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || organization.createdBy === currentUser.id;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Organizations
          </CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <Input
              placeholder="Search organizations..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {currentUser && (
              <Button onClick={() => router.push('/organizations/new')}>
                Create Organization
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading organizations...</div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery
                ? 'No organizations match your search criteria'
                : 'No organizations available. Create an organization to get started!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Groups</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((organization) => (
                    <TableRow key={organization.id}>
                      <TableCell className="font-medium">{organization.name}</TableCell>
                      <TableCell>{organization.description}</TableCell>
                      <TableCell>{organization.members.length}</TableCell>
                      <TableCell>{organization.groups.length}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/organizations/${organization.id}`)}
                        >
                          View
                        </Button>
                        {canManage(organization) && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/organizations/${organization.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteOrganization(organization.id)}
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

export default OrganizationList;
