import type { Program } from './ast';
import { check, type CheckResult } from './checker';
import type { Diagnostic } from './diagnostics';
import { lex, type Token } from './lexer';
import { lower, type Journey } from './lower';
import { network as defaultNetwork, routeProgram, type Network } from './network';
import { parse } from './parser';

export interface CompileResult {
  source: string;
  tokens: Token[];
  program: Program;
  diagnostics: Diagnostic[];
  check: CheckResult;
  /** Present only when there are no errors. */
  journey: Journey | null;
}

/** Only suggest a different route when it saves at least this many minutes. */
const FASTER_ROUTE_THRESHOLD_MIN = 5;

export function compile(source: string, net: Network = defaultNetwork): CompileResult {
  const tokens = lex(source);
  const { program, diagnostics: syntax } = parse(tokens);
  const checked = check(program, net);
  const diagnostics = [...syntax, ...checked.diagnostics];

  let journey: Journey | null = null;
  if (!diagnostics.some((d) => d.severity === 'error') && checked.origin && checked.destination) {
    journey = lower(checked.origin, checked.destination, checked.rides, net);
    const best = journey.legs.length ? net.plan(journey.origin, journey.destination) : null;
    if (best && journey.minutes.total - best.minutes >= FASTER_ROUTE_THRESHOLD_MIN) {
      const saved = Math.round(journey.minutes.total - best.minutes);
      const lines = [...new Set(best.rides.map((r) => r.line.name))].join(' → ');
      const board = program.statements[0];
      diagnostics.push({
        severity: 'info',
        code: 'I401',
        message: `A faster route exists: ${lines}, ~${Math.round(best.minutes)} min (saves ~${saved} min)`,
        span: board.span,
        help: 'Your journey is valid; this is just a suggestion.',
        fix: { label: 'Use faster route', span: program.span, text: routeProgram(journey.origin, best) },
      });
    }
  }

  diagnostics.sort((a, b) => a.span.start - b.span.start);
  return { source, tokens, program, diagnostics, check: checked, journey };
}

export { applyFix, formatDiagnostic, lineCol } from './diagnostics';
export type { Diagnostic, Fix, Span } from './diagnostics';
export type { Journey, Leg, Transfer } from './lower';
export { network, routeProgram, type Line, type Station } from './network';
export { renderIR, renderJourneyText } from './render-text';
