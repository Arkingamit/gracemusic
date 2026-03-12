
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSongs } from '@/contexts/SongContext';
import { useGroups } from '@/contexts/groups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  CardFooter,
} from '@/components/ui/card';

interface AddSongsToGroupProps {
  groupId: string;
  existingSongIds: string[];
  onCancel: () => void;
}

const AddSongsToGroup = ({ groupId, existingSongIds, onCancel }: AddSongsToGroupProps) => {
  const { songs } = useSongs();
  const { addSongToGroup } = useGroups();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Filter out songs that are already in the group
  const availableSongs = songs.filter(song => !existingSongIds.includes(song.id));
  
  // Apply search filter
  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleToggleSelection = (songId: string) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(songId)) {
      newSelection.delete(songId);
    } else {
      newSelection.add(songId);
    }
    setSelectedSongs(newSelection);
  };
  
  const handleAddSongs = async () => {
    if (selectedSongs.size === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Add each selected song to the group
      for (const songId of selectedSongs) {
        await addSongToGroup(groupId, songId);
      }
      
      // Navigate back to group page
      router.push(`/groups/${groupId}`);
    } catch (error) {
      console.error('Failed to add songs to group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Songs to Group</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredSongs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {availableSongs.length === 0 
              ? 'No songs available to add to this group' 
              : 'No songs match your search criteria'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Genre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSongs.has(song.id)}
                        onCheckedChange={() => handleToggleSelection(song.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell>{song.artist}</TableCell>
                    <TableCell>{song.genre}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          disabled={selectedSongs.size === 0 || isSubmitting} 
          onClick={handleAddSongs}
        >
          {isSubmitting 
            ? 'Adding...' 
            : `Add ${selectedSongs.size} ${selectedSongs.size === 1 ? 'Song' : 'Songs'}`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddSongsToGroup;
