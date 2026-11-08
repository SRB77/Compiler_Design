export interface Span {
  start: number;
  end: number;
}

export type Severity = 'error' | 'warning' | 'info';

/** A machine-applicable edit: replace `span` in the source with `text`. */
export interface Fix {
  label: string;
  span: Span;
  text: string;
}

export interface Diagnostic {
  severity: Severity;
  code: string;
  message: string;
  span: Span;
  help?: string;
  fix?: Fix;
}

export function lineCol(source: string, offset: number): { line: number; col: number } {
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, col: offset - lineStart + 1 };
}

export function applyFix(source: string, fix: Fix): string {
  return source.slice(0, fix.span.start) + fix.text + source.slice(fix.span.end);
}

/** Rust-style rendering with a caret under the offending text. */
export function formatDiagnostic(source: string, d: Diagnostic, file = 'journey.metro'): string {
  const { line, col } = lineCol(source, d.span.start);
  const lineText = source.split('\n')[line - 1] ?? '';
  const width = Math.max(1, Math.min(d.span.end, d.span.start + lineText.length - col + 1) - d.span.start);
  const gutter = ' '.repeat(String(line).length);
  const out = [
    `${d.severity}[${d.code}]: ${d.message}`,
    `${gutter}--> ${file}:${line}:${col}`,
    `${gutter} |`,
    `${line} | ${lineText}`,
    `${gutter} | ${' '.repeat(col - 1)}${'^'.repeat(width)}`,
  ];
  if (d.help) out.push(`${gutter} = help: ${d.help}`);
  return out.join('\n');
}
