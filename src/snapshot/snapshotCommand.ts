import { parseEnvFile } from '../parser';
import { diffEnvs } from '../parser/envDiff';
import { formatDiff } from '../formatter/diffFormatter';
import {
  createSnapshot,
  addSnapshot,
  getSnapshot,
  deleteSnapshot,
  listSnapshots,
} from './envSnapshot';

export type SnapshotAction = 'save' | 'diff' | 'list' | 'delete';

export interface SnapshotCommandOptions {
  action: SnapshotAction;
  envFile?: string;
  snapshotId?: string;
  label?: string;
  format?: 'text' | 'json' | 'table';
  storePath?: string;
}

export function runSnapshotCommand(options: SnapshotCommandOptions): string {
  const { action, envFile, snapshotId, label, format = 'text', storePath } = options;

  if (action === 'save') {
    if (!envFile) throw new Error('--env-file is required for save action');
    const data = parseEnvFile(envFile);
    const snapshot = createSnapshot(envFile, data, label);
    addSnapshot(snapshot, storePath);
    return `Snapshot saved: ${snapshot.id} (${snapshot.label}) at ${snapshot.timestamp}`;
  }

  if (action === 'list') {
    const snapshots = listSnapshots(storePath);
    if (snapshots.length === 0) return 'No snapshots found.';
    return snapshots
      .map((s) => `${s.id}  ${s.timestamp}  ${s.label}  (${s.envFile})`)
      .join('\n');
  }

  if (action === 'diff') {
    if (!envFile) throw new Error('--env-file is required for diff action');
    if (!snapshotId) throw new Error('--snapshot-id is required for diff action');
    const snapshot = getSnapshot(snapshotId, storePath);
    if (!snapshot) throw new Error(`Snapshot not found: ${snapshotId}`);
    const current = parseEnvFile(envFile);
    const diff = diffEnvs(snapshot.data, current);
    return formatDiff(diff, format);
  }

  if (action === 'delete') {
    if (!snapshotId) throw new Error('--snapshot-id is required for delete action');
    const removed = deleteSnapshot(snapshotId, storePath);
    return removed ? `Snapshot ${snapshotId} deleted.` : `Snapshot ${snapshotId} not found.`;
  }

  throw new Error(`Unknown snapshot action: ${action}`);
}
