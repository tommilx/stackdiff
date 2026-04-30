import * as fs from 'fs';
import * as path from 'path';
import { EnvMap } from '../parser';

export interface Snapshot {
  id: string;
  label: string;
  timestamp: string;
  envFile: string;
  data: EnvMap;
}

export interface SnapshotStore {
  snapshots: Snapshot[];
}

const DEFAULT_SNAPSHOT_PATH = '.stackdiff-snapshots.json';

export function loadSnapshotStore(storePath: string = DEFAULT_SNAPSHOT_PATH): SnapshotStore {
  if (!fs.existsSync(storePath)) {
    return { snapshots: [] };
  }
  const raw = fs.readFileSync(storePath, 'utf-8');
  try {
    return JSON.parse(raw) as SnapshotStore;
  } catch {
    throw new Error(`Failed to parse snapshot store at "${storePath}": file may be corrupted.`);
  }
}

export function saveSnapshotStore(store: SnapshotStore, storePath: string = DEFAULT_SNAPSHOT_PATH): void {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function createSnapshot(envFile: string, data: EnvMap, label?: string): Snapshot {
  const timestamp = new Date().toISOString();
  const id = `snap_${Date.now()}`;
  return {
    id,
    label: label ?? path.basename(envFile),
    timestamp,
    envFile,
    data,
  };
}

export function addSnapshot(snapshot: Snapshot, storePath?: string): SnapshotStore {
  const store = loadSnapshotStore(storePath);
  store.snapshots.push(snapshot);
  saveSnapshotStore(store, storePath);
  return store;
}

export function getSnapshot(id: string, storePath?: string): Snapshot | undefined {
  const store = loadSnapshotStore(storePath);
  return store.snapshots.find((s) => s.id === id);
}

export function deleteSnapshot(id: string, storePath?: string): boolean {
  const store = loadSnapshotStore(storePath);
  const before = store.snapshots.length;
  store.snapshots = store.snapshots.filter((s) => s.id !== id);
  if (store.snapshots.length < before) {
    saveSnapshotStore(store, storePath);
    return true;
  }
  return false;
}

export function listSnapshots(storePath?: string): Snapshot[] {
  return loadSnapshotStore(storePath).snapshots;
}
