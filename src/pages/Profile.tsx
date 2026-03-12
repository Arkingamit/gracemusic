
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSongs } from '@/contexts/SongContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Song } from '@/lib/types';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { songs } = useSongs();
  const router = useRouter();
  const [userSongs, setUserSongs] = useState<Song[]>([]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Filter songs created by the current user
    const filteredSongs = songs.filter(song => song.createdBy === currentUser.id);
    setUserSongs(filteredSongs);
  }, [currentUser, songs, navigate]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-lg font-medium">{currentUser.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium">{currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge>{currentUser.role}</Badge>
            </div>
            
            <Button variant="destructive" onClick={handleLogout} className="mt-4">
              Logout
            </Button>
          </CardContent>
        </Card>

        {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
          <Card>
            <CardHeader>
              <CardTitle>Your Songs</CardTitle>
            </CardHeader>
            <CardContent>
              {userSongs.length === 0 ? (
                <p className="text-muted-foreground">You haven't created any songs yet.</p>
              ) : (
                <div className="space-y-4">
                  {userSongs.map(song => (
                    <div key={song.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/songs/${song.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => router.push(`/songs/${song.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={() => router.push('/songs/new')} 
                className="w-full mt-4"
              >
                Add New Song
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
