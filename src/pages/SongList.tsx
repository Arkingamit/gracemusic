
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
import { useSongs } from '@/contexts/SongContext';
import { useAuth } from '@/contexts/AuthContext';
import AddToGroupButton from '@/components/AddToGroupButton';

const SongList = () => {
  const { songs, loading, deleteSong } = useSongs();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter songs based on search query
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSong = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(id);
      } catch (error) {
        console.error('Failed to delete song:', error);
      }
    }
  };

  const canEdit = (songCreatedBy: string) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || 
          (currentUser.role === 'editor' && songCreatedBy === currentUser.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-3xl">Songs</CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <Input
              placeholder="Search songs..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {currentUser && currentUser.role !== 'viewer' && (
              <Button onClick={() => router.push('/songs/new')}>
                Add Song
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading songs...</div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery
                ? 'No songs match your search criteria'
                : 'No songs available. Add some songs to get started!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSongs.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell className="font-medium">{song.title}</TableCell>
                      <TableCell>{song.artist}</TableCell>
                      <TableCell>{song.genre}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/songs/${song.id}`)}
                        >
                          View
                        </Button>
                        {currentUser && (
                          <AddToGroupButton 
                            songId={song.id} 
                            songTitle={song.title} 
                          />
                        )}
                        {canEdit(song.createdBy) && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/songs/${song.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteSong(song.id)}
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

export default SongList;
