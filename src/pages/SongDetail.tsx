import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SongDisplay from '@/components/SongDisplay';
import AddToGroupButton from '@/components/AddToGroupButton';
import MetronomeWidget from '@/components/MetronomeWidget';
import { useSongs } from '@/contexts/SongContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Song } from '@/lib/types';
import { generateSongPdf, PdfExportOptions } from '@/lib/pdfUtils';
import { getTransposedKeyName } from '@/lib/chordUtils';
import { detectKey } from '@/lib/keyDetection';
import { Download, Type, Settings } from 'lucide-react';

const SongDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getSong, deleteSong } = useSongs();
  const { currentUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [song, setSong] = useState<Song | undefined>();
  const [transposition, setTransposition] = useState(0);
  const [useFlats, setUseFlats] = useState(false);
  const [showChords, setShowChords] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    if (id) {
      const songData = getSong(id);
      setSong(songData);
      if (!songData) router.replace('/songs');
    }
  }, [id, getSong, router]);

  const canEdit = song && currentUser && (
    currentUser.role === 'admin' || 
    (currentUser.role === 'editor' && song.createdBy === currentUser.id)
  );

  const handleDelete = async () => {
    if (song && window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(song.id);
        router.push('/songs');
      } catch (error) {
        console.error('Failed to delete song:', error);
      }
    }
  };

  const handleExportPdf = () => {
    if (!song) return;
    const pdfOptions: PdfExportOptions = {
      showChords,
      transposition,
      useFlats,
      fontSize
    };
    generateSongPdf([song], pdfOptions);
  };

  if (!song) return null;

  const originalKey = detectKey(song.lyrics);
  const currentKey = getTransposedKeyName(originalKey, transposition);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/songs')}>
            Back to Songs
          </Button>
          {currentUser && (
            <AddToGroupButton songId={song.id} songTitle={song.title} />
          )}
          <Button 
            variant="outline"
            onClick={handleExportPdf}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/songs/${song.id}/edit`)}>
              Edit Song
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Song
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 order-2 lg:order-1">
          <SongDisplay 
            song={song} 
            fontSize={fontSize}
            transposition={transposition}
            useFlats={useFlats}
            onTransposeUp={() => setTransposition(Math.min(transposition + 1, 11))}
            onTransposeDown={() => setTransposition(Math.max(transposition - 1, -11))}
            onResetTransposition={() => setTransposition(0)}
          />
        </div>

        {/* Controls Panel - Responsive Dropdown on Mobile */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Mobile Dropdown */}
          <details className="block lg:hidden border border-border rounded-lg overflow-hidden">
            <summary className="cursor-pointer px-4 py-2 font-semibold bg-secondary">
              Controls
            </summary>
            <div className="p-4">
              <Card className="shadow-none border-none">
                <CardContent className="space-y-6 px-0">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Type className="h-4 w-4" /> Font Size
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button onClick={() => setFontSize((f) => Math.max(12, f - 1))}>-</Button>
                      <span className="text-sm">{fontSize}px</span>
                      <Button onClick={() => setFontSize((f) => Math.min(24, f + 1))}>+</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-flats">Use Flats / Sharps</Label>
                      <Switch
                        id="use-flats"
                        checked={useFlats}
                        onCheckedChange={setUseFlats}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Metronome</Label>
                    <MetronomeWidget />
                  </div>
                </CardContent>
              </Card>
            </div>
          </details>

          {/* Desktop Full Card */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" /> Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4" /> Font Size
                </Label>
                <div className="flex items-center gap-4">
                  <Button onClick={() => setFontSize((f) => Math.max(12, f - 1))}>-</Button>
                  <span className="text-sm">{fontSize}px</span>
                  <Button onClick={() => setFontSize((f) => Math.min(24, f + 1))}>+</Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-flats">Use Flats / Sharps</Label>
                  <Switch
                    id="use-flats"
                    checked={useFlats}
                    onCheckedChange={setUseFlats}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Metronome</Label>
                <MetronomeWidget />
              </div>
            </CardContent> 
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
