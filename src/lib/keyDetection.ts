
import { Chord, Note, Scale } from '@tonaljs/tonal';

/**
 * Extract all unique chords from lyrics
 */
function extractAllChords(lyrics: string): string[] {
  const chordMatches = lyrics.match(/\[([^\]]+)\]/g) || [];
  const chords = chordMatches.map(chord => chord.slice(1, -1));
  return [...new Set(chords)];
}

/**
 * Get the root note from a chord
 */
function getChordRoot(chord: string): string | null {
  try {
    const chordObj = Chord.get(chord);
    return chordObj.tonic || null;
  } catch {
    // Try as simple note
    const noteMatch = chord.match(/^([A-G][#b]?)/);
    return noteMatch ? noteMatch[1] : null;
  }
}

/**
 * Analyze chords to determine the most likely key
 */
export function detectKey(lyrics: string): string {
  const chords = extractAllChords(lyrics);
  
  if (chords.length === 0) {
    return 'C'; // Default fallback
  }

  // Get all root notes from chords
  const rootNotes = chords
    .map(getChordRoot)
    .filter(Boolean) as string[];

  if (rootNotes.length === 0) {
    return chords[0]; // Fallback to first chord
  }

  // Count frequency of each root note
  const noteFrequency = rootNotes.reduce((acc, note) => {
    const normalizedNote = Note.pitchClass(note);
    acc[normalizedNote] = (acc[normalizedNote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Score potential keys based on how many chord roots fit the scale
  const majorKeys = Object.keys(noteFrequency);
  let bestKey = majorKeys[0];
  let bestScore = 0;

  for (const potentialKey of majorKeys) {
    try {
      const majorScale = Scale.get(`${potentialKey} major`);
      const scaleNotes = majorScale.notes.map(note => Note.pitchClass(note));
      
      // Calculate score based on how many roots fit in this major scale
      let score = 0;
      for (const [note, freq] of Object.entries(noteFrequency)) {
        if (scaleNotes.includes(note)) {
          score += freq * 2; // Weight by frequency
        }
      }
      
      // Bonus for the tonic being present
      if (noteFrequency[potentialKey]) {
        score += noteFrequency[potentialKey] * 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestKey = potentialKey;
      }
    } catch (error) {
      // Skip invalid keys
      continue;
    }
  }

  return bestKey;
}
