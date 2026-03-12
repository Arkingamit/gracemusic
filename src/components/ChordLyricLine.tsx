import React from 'react';
import { ParsedLine } from '@/lib/chordParser';

interface ChordLyricLineProps {
  parsedLine: ParsedLine;
  fontSize?: number;
  className?: string;
}

const ChordLyricLine: React.FC<ChordLyricLineProps> = ({ parsedLine, fontSize = 16, className = '' }) => {
  const { lyrics, chords } = parsedLine;
  const chordMap = new Map<number, string>();
  chords.forEach(({ chord, position }) => chordMap.set(position, chord));

  return (
    <div className={`flex flex-wrap font-mono whitespace-pre-wrap ${className}`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.4 }}>
      {lyrics.split('').map((char, idx) => {
        const chord = chordMap.get(idx) || '\u00A0';
        return (
          <span
            key={idx}
            className="flex flex-col items-center"
            style={{ width: `${fontSize * 0.65}px`, textAlign: 'center' }}
          >
            <span className="text-blue-600 font-bold leading-none" style={{ height: `${fontSize}px`, fontSize: `${fontSize * 0.9}px` }}>{chord}</span>
            <span className="leading-none">{char}</span>
          </span>
        );
      })}
    </div>
  );
};

export default ChordLyricLine;