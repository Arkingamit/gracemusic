import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, User, Calendar } from 'lucide-react';
import { Song } from '@/lib/types';
import { getTransposedKeyName } from '@/lib/chordUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useSongs } from '@/contexts/SongContext';
import { useRouter } from 'next/navigation';
import LyricsDisplay from './LyricsDisplay';
import TransposeControls from './TransposeControls';
import { detectKey } from '@/lib/keyDetection';

interface SongDisplayProps {
  song: Song;
  showActions?: boolean;
  fontSize?: number;
  transposition?: number;
  useFlats?: boolean;
  onTransposeUp?: () => void;
  onTransposeDown?: () => void;
  onResetTransposition?: () => void;
}

const SongDisplay: React.FC<SongDisplayProps> = ({ 
  song, 
  showActions = true, 
  fontSize = 16,
  transposition = 0,
  useFlats = false,
  onTransposeUp,
  onTransposeDown,
  onResetTransposition
}) => {
  const [internalTransposition, setInternalTransposition] = useState(0);
  const { currentUser } = useAuth();
  const { deleteSong } = useSongs();
  const router = useRouter();

  // Use external transposition if provided, otherwise use internal state
  const currentTransposition = transposition !== undefined ? transposition : internalTransposition;

  // Reset transposition when song changes
  useEffect(() => {
    if (transposition === undefined) {
      setInternalTransposition(0);
    }
  }, [song.id, transposition]);

  const originalKey = detectKey(song.lyrics);
  const currentKey = getTransposedKeyName(originalKey, currentTransposition);

  const handleTransposeUp = () => {
    if (onTransposeUp) {
      onTransposeUp();
    } else if (internalTransposition < 11) {
      setInternalTransposition(internalTransposition + 1);
    }
  };

  const handleTransposeDown = () => {
    if (onTransposeDown) {
      onTransposeDown();
    } else if (internalTransposition > -11) {
      setInternalTransposition(internalTransposition - 1);
    }
  };

  const handleReset = () => {
    if (onResetTransposition) {
      onResetTransposition();
    } else {
      setInternalTransposition(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Song Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{song.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{song.artist}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  <Badge variant="secondary">{song.genre}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(song.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>
        </CardHeader>
      </Card>

      {/* Lyrics Display */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Lyrics & Chords</CardTitle>
            <TransposeControls
              transposition={currentTransposition}
              currentKey={currentKey}
              onTransposeUp={handleTransposeUp}
              onTransposeDown={handleTransposeDown}
              onReset={handleReset}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-muted/50 p-4 rounded-md">
            <LyricsDisplay
              lyrics={song.lyrics}
              transposition={currentTransposition}
              useFlats={useFlats}
              fontSize={fontSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SongDisplay;
