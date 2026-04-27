import { parseEnvString } from './envParser';
import { diffEnvs } from './envDiff';

describe('diffEnvs', () => {
  const base = parseEnvString('FOO=bar\nSHARED=same\nOLD=gone', 'base.env');
  const target = parseEnvString('FOO=baz\nSHARED=same\nNEW=hello', 'target.env');

  let result: ReturnType<typeof diffEnvs>;

  beforeAll(() => {
    result = diffEnvs(base, target);
  });

  it('detects changed keys', () => {
    const changed = result.entries.filter(e => e.status === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('FOO');
    expect(changed[0].baseValue).toBe('bar');
    expect(changed[0].targetValue).toBe('baz');
  });

  it('detects added keys', () => {
    const added = result.entries.filter(e => e.status === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('NEW');
  });

  it('detects removed keys', () => {
    const removed = result.entries.filter(e => e.status === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('OLD');
  });

  it('detects unchanged keys', () => {
    const unchanged = result.entries.filter(e => e.status === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('SHARED');
  });

  it('returns correct summary counts', () => {
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
    expect(result.summary.changed).toBe(1);
    expect(result.summary.unchanged).toBe(1);
  });

  it('sorts entries alphabetically', () => {
    const keys = result.entries.map(e => e.key);
    expect(keys).toEqual([...keys].sort());
  });
});
