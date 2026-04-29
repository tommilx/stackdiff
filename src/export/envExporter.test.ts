import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exportEnvMap, exportDiff } from './envExporter';
import { DiffResult } from '../parser/envDiff';

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-'));

const sampleEnv = { API_KEY: 'abc123', DB_HOST: 'localhost', PORT: '3000' };

const sampleDiff: DiffResult = {
  added: { NEW_KEY: 'newval' },
  removed: { OLD_KEY: 'oldval' },
  changed: { PORT: { from: '3000', to: '4000' } },
  unchanged: { DB_HOST: 'localhost' },
};

describe('exportEnvMap', () => {
  it('exports env format', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'out.env');
    exportEnvMap(sampleEnv, out, 'env');
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('API_KEY=abc123');
    expect(content).toContain('DB_HOST=localhost');
  });

  it('exports json format', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'out.json');
    exportEnvMap(sampleEnv, out, 'json');
    const parsed = JSON.parse(fs.readFileSync(out, 'utf-8'));
    expect(parsed).toEqual(sampleEnv);
  });

  it('exports csv format', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'out.csv');
    exportEnvMap(sampleEnv, out, 'csv');
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('key,value');
    expect(content).toContain('PORT,3000');
  });

  it('creates missing directories', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'nested', 'deep', 'out.env');
    exportEnvMap(sampleEnv, out, 'env');
    expect(fs.existsSync(out)).toBe(true);
  });
});

describe('exportDiff', () => {
  it('exports full diff as json', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'diff.json');
    exportDiff(sampleDiff, { format: 'json', outputPath: out, includeOnly: 'all' });
    const parsed = JSON.parse(fs.readFileSync(out, 'utf-8'));
    expect(parsed.added).toEqual({ NEW_KEY: 'newval' });
    expect(parsed.removed).toEqual({ OLD_KEY: 'oldval' });
  });

  it('exports only added keys as env format', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'added.env');
    exportDiff(sampleDiff, { format: 'env', outputPath: out, includeOnly: 'added' });
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('+ NEW_KEY=newval');
    expect(content).not.toContain('OLD_KEY');
  });

  it('exports diff as csv', () => {
    const dir = tmpDir();
    const out = path.join(dir, 'diff.csv');
    exportDiff(sampleDiff, { format: 'csv', outputPath: out });
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('status,key,from,to');
    expect(content).toContain('added,NEW_KEY,,newval');
    expect(content).toContain('changed,PORT,3000,4000');
  });
});
