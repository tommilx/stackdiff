import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from '../parser/envParser';
import { diffEnvs } from '../parser/envDiff';
import type { EnvDiff } from '../parser/index';

export type WatchCallback = (diff: EnvDiff, changedFile: string) => void;

export interface WatchHandle {
  stop: () => void;
}

interface WatchState {
  lastContent: Map<string, Record<string, string>>;
  watchers: fs.FSWatcher[];
}

export function watchEnvFiles(
  files: string[],
  onChange: WatchCallback,
  debounceMs = 300
): WatchHandle {
  const state: WatchState = {
    lastContent: new Map(),
    watchers: [],
  };

  for (const file of files) {
    const absPath = path.resolve(file);
    try {
      state.lastContent.set(absPath, parseEnvFile(absPath));
    } catch {
      state.lastContent.set(absPath, {});
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  for (const file of files) {
    const absPath = path.resolve(file);
    const watcher = fs.watch(absPath, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const newContent = parseEnvFile(absPath);
          const oldContent = state.lastContent.get(absPath) ?? {};
          const diff = diffEnvs(oldContent, newContent);
          const hasChanges =
            diff.added.length > 0 ||
            diff.removed.length > 0 ||
            diff.changed.length > 0;
          if (hasChanges) {
            state.lastContent.set(absPath, newContent);
            onChange(diff, absPath);
          }
        } catch {
          // file may be temporarily unavailable during write
        }
      }, debounceMs);
    });
    state.watchers.push(watcher);
  }

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      for (const w of state.watchers) w.close();
    },
  };
}
