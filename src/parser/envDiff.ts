import { ParsedEnv, EnvEntry } from './envParser';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  baseValue?: string;
  targetValue?: string;
  baseLineNumber?: number;
  targetLineNumber?: number;
}

export interface EnvDiffResult {
  baseFile: string;
  targetFile: string;
  entries: DiffEntry[];
  summary: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
  };
}

export function diffEnvs(base: ParsedEnv, target: ParsedEnv): EnvDiffResult {
  const allKeys = new Set([
    ...base.entries.keys(),
    ...target.entries.keys(),
  ]);

  const entries: DiffEntry[] = [];
  const summary = { added: 0, removed: 0, changed: 0, unchanged: 0 };

  for (const key of allKeys) {
    const baseEntry: EnvEntry | undefined = base.entries.get(key);
    const targetEntry: EnvEntry | undefined = target.entries.get(key);

    let status: DiffStatus;

    if (!baseEntry) {
      status = 'added';
      summary.added++;
    } else if (!targetEntry) {
      status = 'removed';
      summary.removed++;
    } else if (baseEntry.value !== targetEntry.value) {
      status = 'changed';
      summary.changed++;
    } else {
      status = 'unchanged';
      summary.unchanged++;
    }

    entries.push({
      key,
      status,
      baseValue: baseEntry?.value,
      targetValue: targetEntry?.value,
      baseLineNumber: baseEntry?.lineNumber,
      targetLineNumber: targetEntry?.lineNumber,
    });
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  return {
    baseFile: base.filePath,
    targetFile: target.filePath,
    entries,
    summary,
  };
}
