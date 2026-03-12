import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { useSongs } from '@/contexts/SongContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { SongInput } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  artist: z.string().min(1, { message: 'Artist is required' }),
  genre: z.string().min(1, { message: 'Genre is required' }),
  lyrics: z.string().min(1, { message: 'Lyrics are required' })
    .refine((lyrics) => {
      // Check for inline chords - chords immediately followed by text without space/newline
      const inlineChordPattern = /\[[^\]]+\][^\s\n\r]/;
      return !inlineChordPattern.test(lyrics);
    }, { message: 'Inline chords are not allowed. Please place chords on separate lines above the lyrics.' }),
});

type FormValues = z.infer<typeof formSchema>;

const AdminSongForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSong } = useSongs();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      artist: '',
      genre: '',
      lyrics: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a song',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const songInput: SongInput = {
        title: values.title,
        artist: values.artist,
        genre: values.genre,
        lyrics: values.lyrics,
        createdBy: currentUser.id,
      };
      
      await addSong(songInput);
      
      toast({
        title: 'Success',
        description: `${values.title} was added to the database!`,
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Failed to add song:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add song',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Song Title</FormLabel>
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
        </div>
        
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <Input placeholder="Enter genre (Rock, Pop, Folk, etc.)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lyrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lyrics with Chords</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={`Enter lyrics with chords positioned above the lyrics, like this:
              [D]               [A]
How great the chasm that lay between us
            [G]       [Bm]           [A]
How high the mountain   I could not climb`}
                  className="font-mono min-h-[300px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground mt-2">
                Chords must be on separate lines above the lyrics. Inline chords like [C]word are not allowed.
              </p>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Song'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdminSongForm;
