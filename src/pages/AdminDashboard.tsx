
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSongs } from '@/contexts/SongContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AdminStats } from '@/lib/types';
import AdminSongForm from '@/components/AdminSongForm';
import AdminSongList from '@/components/AdminSongList';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { songs } = useSongs();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalSongs: 0,
    totalUsers: 0,
    songsPerGenre: {},
    usersCount: 0,
    songsCount: 0,
    groupsCount: 0,
    organizationsCount: 0,
    recentlyAddedSongs: []
  });

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      router.push('/');
      return;
    }

    // Calculate stats
    const songsPerGenre: Record<string, number> = {};
    songs.forEach(song => {
      songsPerGenre[song.genre] = (songsPerGenre[song.genre] || 0) + 1;
    });

    setStats({
      totalSongs: songs.length,
      totalUsers: 2, // Mock data since we don't have a real users table
      songsPerGenre,
      usersCount: 2,
      songsCount: songs.length,
      groupsCount: 3, // Mock data
      organizationsCount: 2, // Mock data
      recentlyAddedSongs: []
    });
  }, [currentUser, navigate, songs, toast]);

  const genreChartData = Object.entries(stats.songsPerGenre).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="songs">Manage Songs</TabsTrigger>
          <TabsTrigger value="add-song">Add Song</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Songs</CardTitle>
                <CardDescription>Current song catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{stats.totalSongs}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Most Popular Genre</CardTitle>
                <CardDescription>Most frequent genre</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.entries(stats.songsPerGenre).length > 0 ? (
                  <p className="text-4xl font-bold text-primary">
                    {Object.entries(stats.songsPerGenre).sort((a, b) => b[1] - a[1])[0][0]}
                  </p>
                ) : (
                  <p className="text-gray-500">No data</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {genreChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Songs by Genre</CardTitle>
                <CardDescription>Distribution of songs across genres</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genreChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="songs">
          <AdminSongList songs={songs} />
        </TabsContent>
        
        <TabsContent value="add-song">
          <Card>
            <CardHeader>
              <CardTitle>Add New Song</CardTitle>
              <CardDescription>Create a new song entry in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSongForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
