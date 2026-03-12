import { Song } from './types';
import { transposeLyrics } from './chordUtils';

export interface PdfExportOptions {
  showChords: boolean;
  transposition: number;
  useFlats: boolean;
  fontSize: number;
}

const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const maxWidth = 550;
      const scale = maxWidth / img.width;
      const width = maxWidth;
      const height = img.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.src = src;
  });
};

export const generateSongPdf = async (
  songs: (Song & { transposition?: number; useFlats?: boolean })[],
  options: PdfExportOptions,
  groupName?: string
) => {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF('landscape', 'mm', 'a4');

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15;
  const columnWidth = (pageWidth - (3 * margin)) / 2;

  const logoBase64 = await loadImageAsBase64('/lovable-uploads/grace-logo.jpg');

  const addWatermark = () => {
    const logoWidth = 60;
    const logoHeight = 40;
    doc.addImage(
      logoBase64,
      'JPEG',
      pageWidth - logoWidth - 10,
      10,
      logoWidth,
      logoHeight
    );
  };

  doc.setFontSize(32);
  doc.text(groupName ? `Songs from ${groupName}` : 'Song Collection', pageWidth / 2, 60, { align: 'center' });
  doc.setFontSize(16);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 80, { align: 'center' });
  doc.text(`Total: ${songs.length} songs`, pageWidth / 2, 100, { align: 'center' });
  addWatermark();

  doc.addPage();
  doc.setFontSize(24);
  doc.text('Table of Contents', margin, 30);
  doc.setFontSize(14);

  let yPos = 50;
  songs.forEach((song, index) => {
    const pageNumber = index + 3;
    doc.text(`${index + 1}. ${song.title} - ${song.artist}`, margin, yPos);
    doc.text(`${pageNumber}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;

    if (yPos > pageHeight - 30) {
      addWatermark();
      doc.addPage();
      yPos = 30;
    }
  });
  addWatermark();

  const cleanChord = (chord: string): string => {
    return chord.replace(/Major/g, '').replace(/Minor/g, 'm').trim();
  };

  songs.forEach((song) => {
    doc.addPage();
    addWatermark();

    doc.setFontSize(20);
    doc.text(song.title, margin, 25);
    doc.setFontSize(14);
    doc.text(`by ${song.artist}`, margin, 35);

    const lyrics = song.lyrics;
    const transposedLyrics =
      song.transposition && song.transposition !== 0
        ? transposeLyrics(lyrics, song.transposition, song.useFlats)
        : lyrics;

    const lines = transposedLyrics.split('\n');
    const chordRegex = /\[(.*?)\]/g;

    const midPoint = Math.ceil(lines.length / 2);
    const leftColumnLines = lines.slice(0, midPoint);
    const rightColumnLines = lines.slice(midPoint);

    const renderColumn = (columnLines: string[], startX: number, startY: number) => {
      let yPosition = startY;

      columnLines.forEach((line) => {
        if (options.showChords) {
          let processedLine = line;
          const matches = line.match(chordRegex);

          if (matches) {
            const chordPositions: { chord: string; position: number }[] = [];
            let match;
            const tempRegex = new RegExp(chordRegex.source, chordRegex.flags);

            while ((match = tempRegex.exec(line)) !== null) {
              chordPositions.push({
                chord: cleanChord(match[1]),
                position: match.index,
              });
            }

            if (chordPositions.length > 0) {
              doc.setFontSize(options.fontSize - 2);
              doc.setFont('helvetica', 'bold');
              chordPositions.forEach(({ chord, position }) => {
                const charWidth = 2.5;
                const chordX = startX + position * charWidth * 0.6;
                if (chordX < startX + columnWidth) {
                  doc.text(chord, chordX, yPosition);
                }
              });
              yPosition += (options.fontSize - 2) * 0.4;
            }

            processedLine = line.replace(chordRegex, '');
          }

          doc.setFontSize(options.fontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(processedLine, startX, yPosition);
        } else {
          const plainLyrics = line.replace(chordRegex, '');
          doc.setFontSize(options.fontSize);
          doc.setFont('helvetica', 'normal');
          doc.text(plainLyrics, startX, yPosition);
        }

        yPosition += options.fontSize * 0.8;
        if (yPosition > pageHeight - 30) return;
      });
    };

    renderColumn(leftColumnLines, margin, 50);
    renderColumn(rightColumnLines, margin + columnWidth + margin, 50);
  });

  doc.save(`songs${groupName ? '-' + groupName.replace(/\s+/g, '-').toLowerCase() : ''}.pdf`);
};
