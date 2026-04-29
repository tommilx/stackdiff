import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createSnapshot,
  addSnapshot,
  getSnapshot,
  deleteSnapshot,
  listSnapshots,
  loadSnapshotStore,
} from './envSnapshot';
import { EnvMap } from '../parser';

function tmpStore(): string {
  return path.join(os.tmpdir(), `snapshot-test-${Date.now()}.json`);
}

const sampleData: EnvMap = { API_KEY: 'abc123', NODE_ENV: 'production' };

describe('envSnapshot', () => {
  it('createSnapshot returns a valid snapshot object', () => {
    const snap = createSnapshot('/app/.env', sampleData, 'prod');
    expect(snap.id).toMatch(/^snap_/);
    expect(snap.label).toBe('prod');
    expect(snap.envFile).toBe('/app/.env');
    expect(snap.data).toEqual(sampleData);
    expect(snap.timestamp).toBeTruthy();
  });

  it('createSnapshot uses basename as label when none provided', () => {
    const snap = createSnapshot('/app/.env.staging', sampleData);
    expect(snap.label).toBe('.env.staging');
  });

  it('addSnapshot persists snapshot to store file', () => {
    const store = tmpStore();
    const snap = createSnapshot('/app/.env', sampleData, 'test');
    addSnapshot(snap, store);
    const loaded = loadSnapshotStore(store);
    expect(loaded.snapshots).toHaveLength(1);
    expect(loaded.snapshots[0].id).toBe(snap.id);
    fs.unlinkSync(store);
  });

  it('getSnapshot retrieves snapshot by id', () => {
    const store = tmpStore();
    const snap = createSnapshot('/app/.env', sampleData);
    addSnapshot(snap, store);
    const found = getSnapshot(snap.id, store);
    expect(found).toBeDefined();
    expect(found!.id).toBe(snap.id);
    fs.unlinkSync(store);
  });

  it('getSnapshot returns undefined for unknown id', () => {
    const store = tmpStore();
    expect(getSnapshot('nonexistent', store)).toBeUndefined();
  });

  it('deleteSnapshot removes the snapshot', () => {
    const store = tmpStore();
    const snap = createSnapshot('/app/.env', sampleData);
    addSnapshot(snap, store);
    const result = deleteSnapshot(snap.id, store);
    expect(result).toBe(true);
    expect(listSnapshots(store)).toHaveLength(0);
    fs.unlinkSync(store);
  });

  it('deleteSnapshot returns false for missing id', () => {
    const store = tmpStore();
    expect(deleteSnapshot('ghost', store)).toBe(false);
  });

  it('listSnapshots returns all snapshots', () => {
    const store = tmpStore();
    addSnapshot(createSnapshot('/a/.env', sampleData, 'a'), store);
    addSnapshot(createSnapshot('/b/.env', sampleData, 'b'), store);
    expect(listSnapshots(store)).toHaveLength(2);
    fs.unlinkSync(store);
  });
});
