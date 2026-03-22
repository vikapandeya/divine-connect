type PdfLine = {
  text: string;
  size?: number;
  bold?: boolean;
  gapBefore?: number;
};

export type PdfColor = [number, number, number];

type PdfTextElement = {
  type: 'text';
  text: string;
  x: number;
  y: number;
  size?: number;
  bold?: boolean;
  color?: PdfColor;
  maxWidth?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
};

type PdfRectElement = {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: PdfColor;
  strokeColor?: PdfColor;
  strokeWidth?: number;
};

type PdfLineElement = {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: PdfColor;
  width?: number;
};

export type PdfElement = PdfTextElement | PdfRectElement | PdfLineElement;

export type PdfPage = {
  width?: number;
  height?: number;
  backgroundColor?: PdfColor;
  elements: PdfElement[];
};

const DEFAULT_PAGE_WIDTH = 595;
const DEFAULT_PAGE_HEIGHT = 842;

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

function normalizeColor(color: PdfColor = [0.16, 0.13, 0.11]) {
  return color.map((value) => Number(value.toFixed(3))) as PdfColor;
}

function estimateTextWidth(text: string, size: number) {
  return Math.max(1, text.length) * size * 0.52;
}

function wrapTextToWidth(text: string, maxWidth: number | undefined, size: number) {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return [''];
  }

  const paragraphs = normalizedText.split(/\n+/);
  const estimatedMaxChars = maxWidth
    ? Math.max(10, Math.floor(maxWidth / Math.max(4, size * 0.52)))
    : Math.max(10, Math.floor(460 / Math.max(4, size * 0.52)));

  return paragraphs.flatMap((paragraph, paragraphIndex) => {
    const wrapped = wrapText(paragraph, estimatedMaxChars);
    if (paragraphIndex === 0) {
      return wrapped;
    }
    return ['', ...wrapped];
  });
}

function buildLegacyPdfContent(lines: PdfLine[]) {
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

function buildStyledPdfContent(page: PdfPage) {
  const commands: string[] = [];
  const width = page.width ?? DEFAULT_PAGE_WIDTH;
  const height = page.height ?? DEFAULT_PAGE_HEIGHT;

  if (page.backgroundColor) {
    const [red, green, blue] = normalizeColor(page.backgroundColor);
    commands.push(`${red} ${green} ${blue} rg`);
    commands.push(`0 0 ${width} ${height} re f`);
  }

  page.elements.forEach((element) => {
    if (element.type === 'rect') {
      commands.push('q');

      if (element.fillColor) {
        const [red, green, blue] = normalizeColor(element.fillColor);
        commands.push(`${red} ${green} ${blue} rg`);
      }

      if (element.strokeColor) {
        const [red, green, blue] = normalizeColor(element.strokeColor);
        commands.push(`${red} ${green} ${blue} RG`);
        commands.push(`${element.strokeWidth ?? 1} w`);
      }

      commands.push(`${element.x} ${element.y} ${element.width} ${element.height} re`);

      if (element.fillColor && element.strokeColor) {
        commands.push('B');
      } else if (element.fillColor) {
        commands.push('f');
      } else if (element.strokeColor) {
        commands.push('S');
      }

      commands.push('Q');
      return;
    }

    if (element.type === 'line') {
      const [red, green, blue] = normalizeColor(element.color ?? [0.8, 0.76, 0.7]);
      commands.push('q');
      commands.push(`${red} ${green} ${blue} RG`);
      commands.push(`${element.width ?? 1} w`);
      commands.push(`${element.x1} ${element.y1} m ${element.x2} ${element.y2} l S`);
      commands.push('Q');
      return;
    }

    const size = element.size ?? 12;
    const lineHeight = element.lineHeight ?? size + 5;
    const [red, green, blue] = normalizeColor(element.color ?? [0.16, 0.13, 0.11]);
    const wrappedLines = wrapTextToWidth(element.text, element.maxWidth, size);

    commands.push('BT');
    commands.push(`${red} ${green} ${blue} rg`);

    wrappedLines.forEach((line, index) => {
      const font = element.bold ? 'F2' : 'F1';
      const lineWidth = estimateTextWidth(line, size);
      let x = element.x;

      if (element.align === 'center') {
        x = element.x - lineWidth / 2;
      } else if (element.align === 'right') {
        x = element.x - lineWidth;
      }

      commands.push(`/${font} ${size} Tf`);
      commands.push(`1 0 0 1 ${x.toFixed(2)} ${(element.y - index * lineHeight).toFixed(2)} Tm`);
      commands.push(`(${escapePdfText(line)}) Tj`);
    });

    commands.push('ET');
  });

  return commands.join('\n');
}

function createPdfBlob(content: string, width = DEFAULT_PAGE_WIDTH, height = DEFAULT_PAGE_HEIGHT) {
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >> endobj`,
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

function downloadBlob(filename: string, blob: Blob) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function downloadPdfDocument(filename: string, lines: PdfLine[]) {
  const blob = createPdfBlob(buildLegacyPdfContent(lines));
  downloadBlob(filename, blob);
}

export function downloadStyledPdfDocument(filename: string, page: PdfPage) {
  const width = page.width ?? DEFAULT_PAGE_WIDTH;
  const height = page.height ?? DEFAULT_PAGE_HEIGHT;
  const blob = createPdfBlob(buildStyledPdfContent(page), width, height);
  downloadBlob(filename, blob);
}
