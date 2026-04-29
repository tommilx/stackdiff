import * as fs from 'fs';
import * as path from 'path';
import { EnvMap } from '../parser';
import { DiffResult } from '../parser/envDiff';

export type ExportFormat = 'env' | 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  includeOnly?: 'added' | 'removed' | 'changed' | 'all';
}

export function exportEnvMap(env: EnvMap, outputPath: string, format: ExportFormat): void {
  const content = serializeEnvMap(env, format);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, 'utf-8');
}

export function exportDiff(diff: DiffResult, options: ExportOptions): void {
  const filtered = filterDiff(diff, options.includeOnly ?? 'all');
  const content = serializeDiff(filtered, options.format);
  const dir = path.dirname(options.outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(options.outputPath, content, 'utf-8');
}

function filterDiff(diff: DiffResult, include: ExportOptions['includeOnly']): DiffResult {
  if (include === 'all') return diff;
  return {
    added: include === 'added' ? diff.added : {},
    removed: include === 'removed' ? diff.removed : {},
    changed: include === 'changed' ? diff.changed : {},
    unchanged: {},
  };
}

function serializeEnvMap(env: EnvMap, format: ExportFormat): string {
  if (format === 'json') return JSON.stringify(env, null, 2);
  if (format === 'csv') {
    const lines = ['key,value'];
    for (const [k, v] of Object.entries(env)) lines.push(`${k},${v}`);
    return lines.join('\n');
  }
  return Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
}

function serializeDiff(diff: DiffResult, format: ExportFormat): string {
  if (format === 'json') return JSON.stringify(diff, null, 2);
  if (format === 'csv') {
    const lines = ['status,key,from,to'];
    for (const k of Object.keys(diff.added)) lines.push(`added,${k},,${diff.added[k]}`);
    for (const k of Object.keys(diff.removed)) lines.push(`removed,${k},${diff.removed[k]},`);
    for (const k of Object.keys(diff.changed)) lines.push(`changed,${k},${diff.changed[k].from},${diff.changed[k].to}`);
    return lines.join('\n');
  }
  const lines: string[] = [];
  for (const k of Object.keys(diff.added)) lines.push(`+ ${k}=${diff.added[k]}`);
  for (const k of Object.keys(diff.removed)) lines.push(`- ${k}=${diff.removed[k]}`);
  for (const k of Object.keys(diff.changed)) lines.push(`~ ${k}: ${diff.changed[k].from} -> ${diff.changed[k].to}`);
  return lines.join('\n');
}
