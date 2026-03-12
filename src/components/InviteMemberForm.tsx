import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberFormProps {
  organizationId: string;
}

const InviteMemberForm = ({ organizationId }: InviteMemberFormProps) => {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { inviteMemberToOrganization } = useOrganizations();
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({ title: 'Invalid email', description: 'Please enter an email address.', variant: 'destructive' });
      return;
    }

    setInviting(true);
    try {
      await inviteMemberToOrganization(organizationId, email.trim());
      toast({ title: 'Invitation sent', description: `An invite was sent to ${email}` });
      setEmail('');
    } catch (error) {
      toast({ title: 'Invite failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="email"
        placeholder="Enter member's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={inviting}
      />
      <Button onClick={handleInvite} disabled={inviting}>
        {inviting ? 'Sending...' : 'Send Invite'}
      </Button>
    </div>
  );
};

export default InviteMemberForm;
