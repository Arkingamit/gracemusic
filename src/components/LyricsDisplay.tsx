import React from 'react';
import ChordLyricLine from './ChordLyricLine';
import { parseLineWithChords, transposeParsedLine, convertToChordPro } from '@/lib/chordParser';

interface LyricsDisplayProps {
  lyrics: string;
  transposition?: number;
  useFlats?: boolean;
  className?: string;
  fontSize?: number;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  transposition = 0,
  useFlats = false,
  className = '',
  fontSize = 16,
}) => {
  if (!lyrics) return null;

  // Step 1: Convert potentially pasted "chords over lyrics" format into ChordPro
  const chordProLyrics = convertToChordPro(lyrics);

  // Step 2: Process all lines (parse + transpose)
  const processedLines = chordProLyrics
    .split('\n')
    .map((line) => {
      const parsed = parseLineWithChords(line);
      return transposeParsedLine(parsed, transposition, useFlats);
    });

  // Step 3: Split lines for 2-column layout
  const mid = Math.ceil(processedLines.length / 2);
  const leftColumn = processedLines.slice(0, mid);
  const rightColumn = processedLines.slice(mid);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Mobile: Single column */}
      <div className="block md:hidden">
        {processedLines.map((line, index) => (
          <ChordLyricLine key={index} parsedLine={line} fontSize={fontSize} />
        ))}
      </div>

      {/* Desktop: Two columns */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-x-8">
        <div className="space-y-2">
          {leftColumn.map((line, index) => (
            <ChordLyricLine key={`left-${index}`} parsedLine={line} fontSize={fontSize} />
          ))}
        </div>
        <div className="space-y-2">
          {rightColumn.map((line, index) => (
            <ChordLyricLine key={`right-${index}`} parsedLine={line} fontSize={fontSize} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LyricsDisplay;
