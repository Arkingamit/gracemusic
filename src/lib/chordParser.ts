// lib/chordParser.ts
import { Chord, Note, Interval } from '@tonaljs/tonal';

export interface ChordPosition {
  chord: string;
  position: number;
}

export interface ParsedLine {
  lyrics: string;
  chords: ChordPosition[];
}

/**
 * Auto-detects if a given text is in "chords over lyrics" format
 * and converts it to ChordPro format ([C]lyrics).
 * Logic: If non-whitespace characters are > 50% of the line, it's a lyric line.
 * Otherwise, it's a chord line.
 */
export function convertToChordPro(rawText: string): string {
  // If the text already has ChordPro brackets, leave it mostly alone 
  // (we still process it so any unbracketed chord lines get fixed, but usually it's one or the other)
  
  const lines = rawText.split('\n');
  const resultLines: string[] = [];
  
  let pendingChordsLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Empty line check
    if (line.trim().length === 0) {
      resultLines.push('');
      continue;
    }

    // Calculate density of non-whitespace characters
    const totalChars = line.length;
    const nonSpaceChars = line.replace(/\s/g, '').length;
    
    // The user's rule: if character ratio > 50%, it's lyrics. Else, chords.
    const isLyrics = (nonSpaceChars / totalChars) > 0.5;

    if (!isLyrics) {
      // It's a chord line
      // If we already had a pending chord line, we should push it as a literal line 
      // (maybe it was chords with no lyrics under them)
      if (pendingChordsLine !== -1) {
        // Just convert the previous chord line to ChordPro standing alone
        resultLines.push(mergeChordsAndLyrics(lines[pendingChordsLine], ""));
      }
      pendingChordsLine = i;
    } else {
      // It's a lyrics line
      if (pendingChordsLine !== -1) {
        // We have chords to apply to this lyrics line
        resultLines.push(mergeChordsAndLyrics(lines[pendingChordsLine], line));
        pendingChordsLine = -1;
      } else {
        // Lyrics line with no chords above it
        resultLines.push(line);
      }
    }
  }

  // If the song ends with a chord line, add it
  if (pendingChordsLine !== -1) {
    resultLines.push(mergeChordsAndLyrics(lines[pendingChordsLine], ""));
  }

  return resultLines.join('\n');
}

/**
 * Helper to merge a chord line and a lyrics line into ChordPro format
 */
function mergeChordsAndLyrics(chordLine: string, lyricLine: string): string {
  // Find all chords and their positions in the chord line
  const chordRegex = /\S+/g;
  const chords: { name: string; index: number }[] = [];
  let match;

  while ((match = chordRegex.exec(chordLine)) !== null) {
    // Check if the "chord" is already bracketed (user mixed formats)
    let chordName = match[0];
    if (chordName.startsWith('[') && chordName.endsWith(']')) {
      chordName = chordName.substring(1, chordName.length - 1);
    }
    chords.push({ name: chordName, index: match.index });
  }

  // Sort chords right-to-left so injecting them doesn't mess up earlier indices
  chords.sort((a, b) => b.index - a.index);

  let merged = lyricLine;

  for (const chord of chords) {
    // If chord index is beyond the length of the lyrics, pad the lyrics with spaces
    if (chord.index > merged.length) {
      merged = merged.padEnd(chord.index, ' ') + `[${chord.name}]`;
    } else {
      // Inject chord at the exact index
      merged = merged.slice(0, chord.index) + `[${chord.name}]` + merged.slice(chord.index);
    }
  }

  return merged;
}

export function parseLineWithChords(line: string): ParsedLine {
  const chords: ChordPosition[] = [];
  let lyrics = '';
  let currentPos = 0;
  let lyricsPos = 0;

  const chordRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = chordRegex.exec(line)) !== null) {
    const chordStart = match.index;
    const chord = match[1];

    const textBefore = line.substring(currentPos, chordStart);
    lyrics += textBefore;
    lyricsPos += textBefore.length;

    chords.push({ chord, position: lyricsPos });
    currentPos = chordStart + match[0].length;
  }

  lyrics += line.substring(currentPos);
  return { lyrics, chords };
}

function formatChordDisplay(chord: string): string {
  let formatted = chord.replace(/major/gi, '').replace(/Minor/g, 'm').replace(/minor/g, 'm');
  return formatted;
}

export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
  if (!chord || semitones === 0) return formatChordDisplay(chord);
  try {
    const chordObj = Chord.get(chord);
    if (!chordObj.tonic) {
      const transposedNote = Note.transpose(chord, Interval.fromSemitones(semitones));
      return formatChordDisplay(useFlats ? Note.enharmonic(transposedNote) : transposedNote || chord);
    }

    const transposedRoot = Note.transpose(chordObj.tonic, Interval.fromSemitones(semitones));
    const finalRoot = useFlats ? Note.enharmonic(transposedRoot) : transposedRoot;
    let result = finalRoot + chordObj.quality;

    if (chord.includes('/')) {
      const parts = chord.split('/');
      if (parts.length === 2) {
        const transposedBass = Note.transpose(parts[1], Interval.fromSemitones(semitones));
        const finalBass = useFlats ? Note.enharmonic(transposedBass) : transposedBass;
        result += '/' + finalBass;
      }
    }

    return formatChordDisplay(result);
  } catch (error) {
    console.warn(`Failed to transpose chord: ${chord}`, error);
    return formatChordDisplay(chord);
  }
}

export function transposeParsedLine(parsedLine: ParsedLine, semitones: number, useFlats: boolean = false): ParsedLine {
  return {
    lyrics: parsedLine.lyrics,
    chords: parsedLine.chords.map(chordPos => ({
      ...chordPos,
      chord: transposeChord(chordPos.chord, semitones, useFlats),
    }))
  };
}

export function parseSongWithChordsInChunks(song: string, chunkSize: number = 40): ParsedLine[] {
  const tokenRegex = /(\[([^\]]+)\])|([^\s]+)/g;
  const chunks: ParsedLine[] = [];

  let currentLyrics = '';
  let currentChords: ChordPosition[] = [];
  let currentChunkWordCount = 0;
  let currentLyricsPos = 0;

  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(song)) !== null) {
    const [fullMatch, bracketed, chordName, lyricWord] = match;

    if (bracketed && chordName) {
      currentChords.push({ chord: chordName, position: currentLyricsPos });
    } else if (lyricWord) {
      currentLyrics += lyricWord + ' ';
      currentLyricsPos += lyricWord.length + 1;
      currentChunkWordCount++;
    }

    if (currentChunkWordCount >= chunkSize) {
      chunks.push({
        lyrics: currentLyrics.trim(),
        chords: [...currentChords]
      });
      currentLyrics = '';
      currentChords = [];
      currentChunkWordCount = 0;
      currentLyricsPos = 0;
    }
  }

  if (currentLyrics.trim().length > 0) {
    chunks.push({
      lyrics: currentLyrics.trim(),
      chords: [...currentChords]
    });
  }

  return chunks;
}
