
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SongForm from '@/components/SongForm';
import { useSongs } from '@/contexts/SongContext';
import { useAuth } from '@/contexts/AuthContext';
import { Song } from '@/lib/types';

const SongEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { getSong } = useSongs();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [song, setSong] = useState<Song | undefined>();

  useEffect(() => {
    if (id) {
      const songData = getSong(id);
      setSong(songData);
      
      if (!songData) {
        router.replace('/songs');
        return;
      }
      
      // Check if user has permission to edit
      if (
        currentUser && 
        currentUser.role !== 'admin' && 
        (currentUser.role !== 'editor' || songData.createdBy !== currentUser.id)
      ) {
        router.replace(`/songs/${id}`);
      }
    }
  }, [id, getSong, router, currentUser]);

  if (!song) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Song</h1>
      <SongForm 
        song={song} 
        onSuccess={() => router.push(`/songs/${id}`)} 
      />
    </div>
  );
};

export default SongEdit;
