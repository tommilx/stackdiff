import { DiffResult, DiffEntry } from '../parser/envDiff';

export type OutputFormat = 'text' | 'json' | 'table';

const ADDED_SYMBOL = '+';
const REMOVED_SYMBOL = '-';
const CHANGED_SYMBOL = '~';
const UNCHANGED_SYMBOL = ' ';

const COLORS = {
  added: '\x1b[32m',
  removed: '\x1b[31m',
  changed: '\x1b[33m',
  unchanged: '\x1b[90m',
  reset: '\x1b[0m',
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

export function formatText(diff: DiffResult, useColor = true): string {
  const lines: string[] = [];

  for (const entry of diff.entries) {
    let line: string;

    switch (entry.status) {
      case 'added':
        line = `${ADDED_SYMBOL} ${entry.key}=${entry.rightValue ?? ''}`;
        if (useColor) line = colorize(line, 'added');
        break;
      case 'removed':
        line = `${REMOVED_SYMBOL} ${entry.key}=${entry.leftValue ?? ''}`;
        if (useColor) line = colorize(line, 'removed');
        break;
      case 'changed':
        line = `${CHANGED_SYMBOL} ${entry.key}: ${entry.leftValue ?? ''} → ${entry.rightValue ?? ''}`;
        if (useColor) line = colorize(line, 'changed');
        break;
      case 'unchanged':
        line = `${UNCHANGED_SYMBOL} ${entry.key}=${entry.leftValue ?? ''}`;
        if (useColor) line = colorize(line, 'unchanged');
        break;
    }

    lines.push(line!);
  }

  const summary = `\nSummary: +${diff.stats.added} added, -${diff.stats.removed} removed, ~${diff.stats.changed} changed, ${diff.stats.unchanged} unchanged`;
  lines.push(summary);

  return lines.join('\n');
}

export function formatJson(diff: DiffResult): string {
  return JSON.stringify(diff, null, 2);
}

export function formatTable(diff: DiffResult): string {
  const header = `${'KEY'.padEnd(30)} ${'STATUS'.padEnd(10)} ${'LEFT'.padEnd(25)} ${'RIGHT'.padEnd(25)}`;
  const separator = '-'.repeat(92);
  const rows = diff.entries.map((entry: DiffEntry) => {
    const key = entry.key.padEnd(30);
    const status = entry.status.padEnd(10);
    const left = (entry.leftValue ?? '').padEnd(25);
    const right = (entry.rightValue ?? '').padEnd(25);
    return `${key} ${status} ${left} ${right}`;
  });

  return [header, separator, ...rows].join('\n');
}

export function formatDiff(diff: DiffResult, format: OutputFormat = 'text', useColor = true): string {
  switch (format) {
    case 'json':
      return formatJson(diff);
    case 'table':
      return formatTable(diff);
    case 'text':
    default:
      return formatText(diff, useColor);
  }
}
