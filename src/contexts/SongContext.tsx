import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from 'react';
import { Song, SongInput } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, authFetch } from './AuthContext';

interface SongContextType {
  songs: Song[];
  loading: boolean;
  addSong: (song: SongInput) => Promise<void>;
  getSong: (id: string) => Song | undefined;
  updateSong: (id: string, song: Partial<Song>) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  getAllSongs: () => Song[];
  refreshSongs: () => Promise<void>;
}

const SongContext = createContext<SongContextType | null>(null);

export const SongProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Fetch songs from API
  const refreshSongs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/songs');
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs);
      }
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSongs();
  }, [refreshSongs]);

  const addSong = async (songInput: SongInput) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to add a song');
      if (currentUser.role === 'viewer') throw new Error('You do not have permission to add songs');

      const res = await authFetch('/api/songs', {
        method: 'POST',
        body: JSON.stringify(songInput),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add song');

      setSongs(prev => [...prev, data.song]);

      toast({
        title: 'Song added',
        description: `${data.song.title} has been added successfully`
      });
    } catch (error) {
      toast({
        title: 'Failed to add song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSong = (id: string) => songs.find(song => song.id === id);

  const updateSong = async (id: string, updatedSongData: Partial<Song>) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to update a song');

      const res = await authFetch(`/api/songs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedSongData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update song');

      setSongs(prev => prev.map(s => s.id === id ? data.song : s));

      toast({
        title: 'Song updated',
        description: `${data.song.title} has been updated successfully`
      });
    } catch (error) {
      toast({
        title: 'Failed to update song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSong = async (id: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to delete a song');

      const song = songs.find(s => s.id === id);
      if (!song) throw new Error('Song not found');

      const res = await authFetch(`/api/songs/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete song');
      }

      setSongs(prev => prev.filter(s => s.id !== id));

      toast({
        title: 'Song deleted',
        description: `${song.title} has been deleted successfully`
      });
    } catch (error) {
      toast({
        title: 'Failed to delete song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllSongs = () => songs;

  const value: SongContextType = {
    songs,
    loading,
    addSong,
    getSong,
    updateSong,
    deleteSong,
    getAllSongs,
    refreshSongs
  };

  return <SongContext.Provider value={value}>{children}</SongContext.Provider>;
};

export const useSongs = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSongs must be used within a SongProvider');
  }
  return context;
};
