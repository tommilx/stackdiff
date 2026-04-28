import { DiffResult } from '../parser/index';

export interface SummaryStats {
  total: number;
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export interface SummaryReport {
  stats: SummaryStats;
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
  hasChanges: boolean;
}

export function computeSummary(diff: DiffResult): SummaryReport {
  const addedKeys: string[] = [];
  const removedKeys: string[] = [];
  const changedKeys: string[] = [];
  let unchanged = 0;

  for (const [key, entry] of Object.entries(diff)) {
    switch (entry.status) {
      case 'added':
        addedKeys.push(key);
        break;
      case 'removed':
        removedKeys.push(key);
        break;
      case 'changed':
        changedKeys.push(key);
        break;
      case 'unchanged':
        unchanged++;
        break;
    }
  }

  const added = addedKeys.length;
  const removed = removedKeys.length;
  const changed = changedKeys.length;
  const total = added + removed + changed + unchanged;

  return {
    stats: { total, added, removed, changed, unchanged },
    addedKeys: addedKeys.sort(),
    removedKeys: removedKeys.sort(),
    changedKeys: changedKeys.sort(),
    hasChanges: added > 0 || removed > 0 || changed > 0,
  };
}

export function formatSummary(report: SummaryReport): string {
  const { stats } = report;
  const lines: string[] = [
    `Summary: ${stats.total} key(s) total`,
    `  + ${stats.added} added`,
    `  - ${stats.removed} removed`,
    `  ~ ${stats.changed} changed`,
    `  = ${stats.unchanged} unchanged`,
  ];

  if (!report.hasChanges) {
    lines.push('\nNo differences found.');
  }

  return lines.join('\n');
}
