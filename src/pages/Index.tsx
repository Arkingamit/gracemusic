
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useSongs } from '@/contexts/SongContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizations } from '@/contexts/OrganizationContext';
import { Building, Users } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { songs } = useSongs();
  const { currentUser } = useAuth();
  const { getUserOrganizations } = useOrganizations();
  const router = useRouter();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/songs?search=${encodeURIComponent(searchQuery)}`);
  };
  
  // Get the latest 3 songs
  const latestSongs = [...songs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  
  // Get organizations the user belongs to
  const userOrganizations = currentUser ? getUserOrganizations() : [];
  
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-background to-muted py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/38d03c7b-dbd8-42ae-8501-7b5bb7e29495.png" 
              alt="Grace Music Logo" 
              className="h-24 md:h-32" 
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Grace Music
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Store, display, and transpose songs with embedded chords. Perfect for musicians and songwriters.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <Input
              placeholder="Search songs by title, artist, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              size="lg" 
              onClick={() => router.push('/songs')}
            >
              Browse Songs
            </Button>
            {currentUser && userOrganizations.length > 0 && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/groups')}
              >
                Your Song Sets
              </Button>
            )}
            {currentUser ? (
              currentUser.role !== 'viewer' && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => router.push('/songs/new')}
                >
                  Add Song
                </Button>
              )
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/register')}
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>ChordPro Format</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Store lyrics with embedded chords using the popular ChordPro format. Simply add chords in [brackets].</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Transpose Chords</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Easily change keys with real-time chord transposition. Display chords in sharps or flats as needed.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Collaborate in Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Create song groups, invite friends, chat about songs, and collaborate on song collections together.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Latest songs section */}
      {latestSongs.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Latest Songs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestSongs.map(song => (
                <Card key={song.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{song.title}</CardTitle>
                    <CardDescription>{song.artist}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{song.genre}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/songs/${song.id}`)}
                    >
                      View Song
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                size="lg" 
                onClick={() => router.push('/songs')}
              >
                View All Songs
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
