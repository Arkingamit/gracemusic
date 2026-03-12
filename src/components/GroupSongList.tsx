import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSongs } from '@/contexts/SongContext';
import { useGroups } from '@/contexts/groups';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Song, SongTransposition } from '@/lib/types';
import { transposeLyrics, getTransposedKeyName } from '@/lib/chordUtils';
import { detectKey } from '@/lib/keyDetection';
import { toast } from '@/components/ui/use-toast';
import { ArrowUpDown, Trash2, RefreshCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import TransposeControls from '@/components/TransposeControls';
import LyricsDisplay from '@/components/LyricsDisplay';

interface GroupSongListProps {
  groupId: string;
  groupSongIds: string[];
  groupName?: string;
}

const GroupSongList = ({ groupId, groupSongIds }: GroupSongListProps) => {
  const { songs } = useSongs();
  const { removeSongFromGroup, getGroup, updateGroup } = useGroups();
  const { currentUser } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [transposeValues, setTransposeValues] = useState<Record<string, number>>({});
  const [useFlatValues, setUseFlatValues] = useState<Record<string, boolean>>({});
  const [fontSizes, setFontSizes] = useState<Record<string, number>>({});
  const [metronomeStates, setMetronomeStates] = useState<Record<string, boolean>>({});

  const groupSongs = songs.filter(song => groupSongIds.includes(song.id));
  const group = getGroup(groupId);

  useEffect(() => {
    if (group?.songTranspositions) {
      const transpositions: Record<string, number> = {};
      const flats: Record<string, boolean> = {};

      group.songTranspositions.forEach(({ songId, transposition, useFlats }) => {
        transpositions[songId] = transposition;
        flats[songId] = useFlats || false;
      });

      setTransposeValues(transpositions);
      setUseFlatValues(flats);
    }
  }, [group]);

  const filteredSongs = useMemo(() =>
    groupSongs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery, groupSongs]);

  const songOriginalKeys = useMemo(() => {
    const keys: Record<string, string> = {};
    filteredSongs.forEach(song => {
      keys[song.id] = detectKey(song.lyrics);
    });
    return keys;
  }, [filteredSongs]);

  const handleTranspose = async (songId: string, semitones: number) => {
    setTransposeValues(prev => {
      const newValue = (prev[songId] || 0) + semitones;
      return { ...prev, [songId]: newValue };
    });
    await saveTranspositionsToGroup();
  };

  const handleResetTranspose = async (songId: string) => {
    setTransposeValues(prev => ({ ...prev, [songId]: 0 }));
    await saveTranspositionsToGroup();
  };

  const handleUseFlatChange = async (songId: string, value: boolean) => {
    setUseFlatValues(prev => ({ ...prev, [songId]: value }));
    await saveTranspositionsToGroup();
  };

  const handleFontSizeChange = (songId: string, delta: number) => {
    setFontSizes(prev => {
      const currentSize = prev[songId] || 16;
      return { ...prev, [songId]: Math.max(12, currentSize + delta) };
    });
  };

  const handleMetronomeToggle = (songId: string) => {
    setMetronomeStates(prev => ({
      ...prev,
      [songId]: !prev[songId],
    }));
  };

  const saveTranspositionsToGroup = async () => {
    if (!group) return;
    const songTranspositions: SongTransposition[] = Object.keys(transposeValues).map(songId => ({
      songId,
      transposition: transposeValues[songId],
      useFlats: useFlatValues[songId] || false
    }));
    await updateGroup(groupId, { songTranspositions });
  };

  const resetAllTranspositions = async () => {
    setTransposeValues({});
    setUseFlatValues({});
    await updateGroup(groupId, { songTranspositions: [] });
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle>Group Songs</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search songs..."
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" onClick={resetAllTranspositions} className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" /> Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSongs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No songs found.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSongs.map(song => {
                const transposition = transposeValues[song.id] || 0;
                const useFlats = useFlatValues[song.id] || false;
                const originalKey = songOriginalKeys[song.id];
                const currentKey = originalKey ? getTransposedKeyName(originalKey, transposition) : 'Unknown';
                const fontSize = fontSizes[song.id] || 16;
                const metronomeOn = metronomeStates[song.id] || false;

                return (
                  <Card key={song.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          {song.title}
                          <span className="text-sm text-muted-foreground">({currentKey})</span>
                        </CardTitle>
                        <TransposeControls
                          transposition={transposition}
                          currentKey={currentKey}
                          onTransposeUp={() => handleTranspose(song.id, 1)}
                          onTransposeDown={() => handleTranspose(song.id, -1)}
                          onReset={() => handleResetTranspose(song.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex items-center gap-2">
                        <Switch
                          id={`flat-${song.id}`}
                          checked={useFlats}
                          onCheckedChange={(checked) => handleUseFlatChange(song.id, checked)}
                        />
                        <Label htmlFor={`flat-${song.id}`}>Use flats</Label>
                      </div>
                      <LyricsDisplay
                        lyrics={song.lyrics}
                        transposition={transposition}
                        useFlats={useFlats}
                        fontSize={fontSize}
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleFontSizeChange(song.id, 2)}>A+</Button>
                        <Button variant="outline" size="sm" onClick={() => handleFontSizeChange(song.id, -2)}>A-</Button>
                        <Button
                          variant={metronomeOn ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleMetronomeToggle(song.id)}
                        >
                          {metronomeOn ? "Metronome On" : "Metronome Off"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/songs/${song.id}`)}>View</Button>
                        {currentUser && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSongFromGroup(groupId, song.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSongList;
