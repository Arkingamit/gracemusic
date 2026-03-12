import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Song, SongInput, Genre } from '@/lib/types';
import { useSongs } from '@/contexts/SongContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  artist: z.string().min(2, { message: 'Artist must be at least 2 characters' }),
  genre: z.string().min(1, { message: 'Please select a genre' }),
  lyrics: z.string().min(10, { message: 'Lyrics must be at least 10 characters' })
});

type FormData = z.infer<typeof formSchema>;

interface SongFormProps {
  song?: Song;
  onSuccess?: () => void;
}

const SongForm: React.FC<SongFormProps> = ({ song, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const { toast } = useToast();
  const { addSong, updateSong } = useSongs();
  const { currentUser } = useAuth();
  const router = useRouter();
  const isEditing = !!song;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: song?.title || '',
      artist: song?.artist || '',
      genre: song?.genre || '',
      lyrics: song?.lyrics || '',
    },
  });

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        // Mock genres for now - in a real app, this would fetch from the backend
        const mockGenres: Genre[] = [
          { id: '1', name: 'Rock', createdAt: new Date().toISOString() },
          { id: '2', name: 'Pop', createdAt: new Date().toISOString() },
          { id: '3', name: 'Country', createdAt: new Date().toISOString() },
          { id: '4', name: 'Blues', createdAt: new Date().toISOString() },
          { id: '5', name: 'Jazz', createdAt: new Date().toISOString() },
          { id: '6', name: 'Classical', createdAt: new Date().toISOString() },
          { id: '7', name: 'Folk', createdAt: new Date().toISOString() },
          { id: '8', name: 'Gospel', createdAt: new Date().toISOString() },
          { id: '9', name: 'R&B', createdAt: new Date().toISOString() },
          { id: '10', name: 'Electronic', createdAt: new Date().toISOString() },
          { id: '11', name: 'Alternative', createdAt: new Date().toISOString() },
          { id: '12', name: 'Indie', createdAt: new Date().toISOString() },
        ];
        setGenres(mockGenres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        toast({
          title: 'Error',
          description: 'Failed to load genres',
          variant: 'destructive',
        });
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, [toast]);

  const onSubmit = async (data: FormData) => {
    if (!currentUser) {
      toast({
        title: 'Not authorized',
        description: 'You must be logged in to submit a song',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing && song) {
        await updateSong(song.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        
        toast({
          title: 'Song updated',
          description: `${data.title} has been updated successfully`,
        });
      } else {
        // Create a properly typed object for adding a song
        const songInput: SongInput = {
          title: data.title,
          artist: data.artist,
          genre: data.genre,
          lyrics: data.lyrics,
          createdBy: currentUser.id,
        };
        
        await addSong(songInput);
        
        toast({
          title: 'Song added',
          description: `${data.title} has been added successfully`,
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/songs');
      }
    } catch (error) {
      toast({
        title: isEditing ? 'Failed to update song' : 'Failed to add song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter song title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter artist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingGenres}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingGenres ? "Loading genres..." : "Select a genre"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lyrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lyrics and Chords</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={`Em         C            G
Water You turned into wine
Em         C            G
Opened the eyes of the blind
                 Am
There's no one like You`}
                      className="min-h-[300px] font-mono whitespace-pre"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground mt-2">
                    Paste your song exactly as you see it! You can paste standard format with chords on the line above the lyrics, or use [ChordPro] bracket format.
                  </p>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Song' : 'Add Song'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SongForm;
