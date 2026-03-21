type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
  gapBefore?: number;
};

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxChars) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function buildPdfContent(lines: PdfLine[]) {
  const commands: string[] = [
    '1 0.45 0.09 rg',
    '48 812 499 6 re f',
    '0.16 0.13 0.11 rg',
    'BT',
  ];
  let y = 800;

  lines.forEach((line) => {
    y -= line.gapBefore ?? 0;
    const size = line.size ?? 12;
    const font = line.bold ? 'F2' : 'F1';
    const wrapLimit = Math.max(36, Math.floor(92 - size));

    wrapText(line.text, wrapLimit).forEach((wrappedLine, index) => {
      commands.push(`/${font} ${size} Tf`);
      commands.push(`1 0 0 1 48 ${y} Tm`);
      commands.push(`(${escapePdfText(wrappedLine)}) Tj`);
      y -= index === 0 ? size + 8 : size + 4;
    });
  });

  commands.push('ET');
  commands.push('0.92 0.74 0.55 rg');
  commands.push('48 44 499 1 re f');
  return commands.join('\n');
}

function createPdfBlob(lines: PdfLine[]) {
  const content = buildPdfContent(lines);

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >> endobj',
    `4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream\nendobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadPdfDocument(filename: string, lines: PdfLine[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = createPdfBlob(lines);
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
