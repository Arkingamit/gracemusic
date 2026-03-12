
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddToGroupModal from './AddToGroupModal';
import { useAuth } from '@/contexts/AuthContext';

interface AddToGroupButtonProps {
  songId: string;
  songTitle: string;
}

const AddToGroupButton = ({ songId, songTitle }: AddToGroupButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();

  // Only render button if user is logged in
  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add to Group
      </Button>

      {showModal && (
        <AddToGroupModal 
          songId={songId}
          songTitle={songTitle}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default AddToGroupButton;
