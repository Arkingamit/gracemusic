
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">About Grace Music</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>What is Grace Music?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">
              Grace Music is a platform designed for musicians and songwriters to store, display, and transpose song lyrics with embedded chords. It uses the ChordPro format, where chords are placed in square brackets within the lyrics text.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>ChordPro Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed mb-4">
              The ChordPro format is a simple way to embed chords within lyrics. Put chords in square brackets right before the syllable they belong to:
            </p>
            <div className="bg-accent p-4 rounded-md font-mono">
              <p>[C]Amazing [F]grace, how [C]sweet the [G]sound</p>
              <p>[C]That [F]saved a wretch like [G]me</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transposition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">
              The transposition feature allows you to change the key of a song without rewriting all the chords. Select a number of half-steps (semitones) to shift by, and all chords will be automatically adjusted. You can also switch between sharp (#) and flat (b) notation.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Admin:</strong> Can add, edit, and delete any song in the system.</li>
              <li><strong>Editor:</strong> Can add new songs and edit/delete their own songs.</li>
              <li><strong>Viewer:</strong> Can view songs but not edit or add content.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">
              For questions or support, please contact to us
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
