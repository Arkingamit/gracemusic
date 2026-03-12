
import { Chord, Note, Interval, Scale } from '@tonaljs/tonal';

/**
 * Transpose a single chord by a given number of semitones using Tonal
 * @param chord The chord to transpose (e.g. "Am", "C#7", "F/G")
 * @param semitones Number of semitones to transpose (positive = up, negative = down)
 * @param useFlats Whether to use flats instead of sharps in the result
 * @returns The transposed chord
 */
export const transposeChord = (
  chord: string, 
  semitones: number,
  useFlats: boolean = false
): string => {
  if (!chord || semitones === 0) return chord;

  try {
    // Parse the chord using Tonal
    const chordObj = Chord.get(chord);
    
    if (!chordObj.tonic) {
      // If Tonal can't parse it, try as a simple note
      const transposedNote = Note.transpose(chord, Interval.fromSemitones(semitones));
      return useFlats ? Note.enharmonic(transposedNote) : transposedNote || chord;
    }

    // Transpose the root note
    const transposedRoot = Note.transpose(chordObj.tonic, Interval.fromSemitones(semitones));
    const finalRoot = useFlats ? Note.enharmonic(transposedRoot) : transposedRoot;
    
    // Handle slash chords (bass notes)
    let result = finalRoot + chordObj.quality;
    
    // If there's a bass note, transpose it too
    if (chord.includes('/')) {
      const parts = chord.split('/');
      if (parts.length === 2) {
        const bassNote = parts[1];
        const transposedBass = Note.transpose(bassNote, Interval.fromSemitones(semitones));
        const finalBass = useFlats ? Note.enharmonic(transposedBass) : transposedBass;
        result = result + '/' + finalBass;
      }
    }
    
    return result;
  } catch (error) {
    // If Tonal fails to parse, fall back to original chord
    console.warn(`Failed to transpose chord: ${chord}`, error);
    return chord;
  }
};

/**
 * Transpose a single note by a given number of semitones using Tonal
 * @param note The note to transpose (e.g. "C", "F#", "Bb")
 * @param semitones Number of semitones to transpose
 * @param useFlats Whether to use flats instead of sharps
 * @returns The transposed note
 */
export const transposeNote = (
  note: string, 
  semitones: number,
  useFlats: boolean = false
): string => {
  if (!note || semitones === 0) return note;
  
  try {
    const transposed = Note.transpose(note, Interval.fromSemitones(semitones));
    return useFlats ? Note.enharmonic(transposed) : transposed || note;
  } catch (error) {
    console.warn(`Failed to transpose note: ${note}`, error);
    return note;
  }
};

/**
 * Transpose all chords in lyrics text
 * @param lyrics Lyrics text with chords in [chord] format
 * @param semitones Number of semitones to transpose by
 * @param useFlats Whether to use flats instead of sharps
 * @returns Transposed lyrics text
 */
export const transposeLyrics = (
  lyrics: string,
  semitones: number,
  useFlats: boolean = false
): string => {
  // If no transposition or no lyrics, return as is
  if (semitones === 0 || !lyrics) return lyrics;
  
  // Find all chord brackets [chord] and transpose each chord
  return lyrics.replace(/\[([^\]]+)\]/g, (match, chord) => {
    const transposedChord = transposeChord(chord, semitones, useFlats);
    return `[${transposedChord}]`;
  });
};

/**
 * Extract chords from lyrics for displaying chord diagrams
 * @param lyricsWithChords Lyrics text with chords in [chord] format
 * @returns Array of unique chords
 */
export const extractChordsFromLyrics = (lyricsWithChords: string): string[] => {
  if (!lyricsWithChords) return [];
  
  const chordMatches = lyricsWithChords.match(/\[([^\]]+)\]/g) || [];
  const chords = chordMatches.map(chord => chord.slice(1, -1));
  
  // Remove duplicates and return
  return [...new Set(chords)];
};

/**
 * Get relative key name for a transposition using Tonal
 * @param originalKey Original key (e.g. "C", "Am")
 * @param semitones Number of semitones transposed
 * @returns String describing the new key
 */
export function getTransposedKeyName(originalKey: string, semitones: number): string {
  if (!originalKey || semitones === 0) return originalKey;
  
  try {
    // Extract the root note from the key name
    const match = originalKey.match(/^([A-G][#b]?)(.*)/);
    if (!match) return originalKey;
    
    const [, rootNote, mode] = match;
    const transposedRoot = Note.transpose(rootNote, Interval.fromSemitones(semitones));
    
    return transposedRoot + mode;
  } catch (error) {
    console.warn(`Failed to transpose key: ${originalKey}`, error);
    return originalKey;
  }
}

/**
 * Generate common chord progressions for a given key using Tonal
 * @param key The root key (e.g. "C", "G")
 * @returns Object with common chord progressions
 */
export function getCommonProgressions(key: string): Record<string, string[]> {
  try {
    const majorScale = getMajorScaleChords(key);
    
    return {
      'I-IV-V': [majorScale[0], majorScale[3], majorScale[4]],
      'I-V-vi-IV': [majorScale[0], majorScale[4], majorScale[5], majorScale[3]],
      'ii-V-I': [majorScale[1], majorScale[4], majorScale[0]],
      'I-vi-IV-V': [majorScale[0], majorScale[5], majorScale[3], majorScale[4]]
    };
  } catch (error) {
    console.warn(`Failed to generate progressions for key: ${key}`, error);
    return {};
  }
}

/**
 * Get all diatonic chords in a major key using Tonal
 * @param key The root key (e.g. "C", "G")
 * @returns Array of 7 diatonic chords
 */
function getMajorScaleChords(key: string): string[] {
  try {
    // Get the major scale notes using Scale
    const scaleNotes = Scale.get(`${key} major`).notes;
    
    // Chord qualities for major scale: M, m, m, M, M, m, dim
    const qualities = ['', 'm', 'm', '', '', 'm', 'dim'];
    
    return scaleNotes.map((note, idx) => {
      return note + qualities[idx];
    });
  } catch (error) {
    console.warn(`Failed to get major scale chords for key: ${key}`, error);
    return [];
  }
}
