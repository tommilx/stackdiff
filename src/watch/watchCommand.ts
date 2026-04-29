import * as path from 'path';
import { watchEnvFiles } from './envWatcher';
import { formatDiff } from '../formatter/diffFormatter';
import { formatSummary, computeSummary } from '../reporter/summaryReporter';
import type { EnvDiff } from '../parser/index';

export interface WatchCommandOptions {
  files: string[];
  format?: 'text' | 'json';
  debounce?: number;
  silent?: boolean;
}

export function runWatchCommand(options: WatchCommandOptions): () => void {
  const { files, format = 'text', debounce = 300, silent = false } = options;

  if (files.length === 0) {
    throw new Error('At least one file must be provided to watch.');
  }

  const resolvedFiles = files.map((f) => path.resolve(f));

  if (!silent) {
    console.log(`Watching ${resolvedFiles.length} file(s) for changes...`);
    resolvedFiles.forEach((f) => console.log(`  ${f}`));
  }

  const handle = watchEnvFiles(
    resolvedFiles,
    (diff: EnvDiff, changedFile: string) => {
      const timestamp = new Date().toISOString();
      if (!silent) {
        console.log(`\n[${timestamp}] Change detected in: ${changedFile}`);
      }

      if (format === 'json') {
        console.log(JSON.stringify({ timestamp, file: changedFile, diff }, null, 2));
      } else {
        const output = formatDiff(diff, { format: 'text', color: true });
        console.log(output);
        const summary = computeSummary(diff);
        console.log(formatSummary(summary));
      }
    },
    debounce
  );

  return () => handle.stop();
}
