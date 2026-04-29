import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFiles } from './envWatcher';

function writeTmp(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('watchEnvFiles', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-watch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('calls onChange when a file is modified', (done) => {
    const file = writeTmp(tmpDir, '.env', 'KEY=old\n');
    const handle = watchEnvFiles([file], (diff, changedFile) => {
      handle.stop();
      expect(changedFile).toBe(path.resolve(file));
      expect(diff.changed).toHaveLength(1);
      expect(diff.changed[0].key).toBe('KEY');
      done();
    }, 50);

    setTimeout(() => {
      fs.writeFileSync(file, 'KEY=new\n', 'utf-8');
    }, 80);
  }, 3000);

  it('detects added keys', (done) => {
    const file = writeTmp(tmpDir, '.env2', 'A=1\n');
    const handle = watchEnvFiles([file], (diff) => {
      handle.stop();
      expect(diff.added.some((e) => e.key === 'B')).toBe(true);
      done();
    }, 50);

    setTimeout(() => {
      fs.writeFileSync(file, 'A=1\nB=2\n', 'utf-8');
    }, 80);
  }, 3000);

  it('stop() prevents further callbacks', (done) => {
    const file = writeTmp(tmpDir, '.env3', 'X=1\n');
    let callCount = 0;
    const handle = watchEnvFiles([file], () => { callCount++; }, 50);
    handle.stop();
    setTimeout(() => {
      fs.writeFileSync(file, 'X=2\n', 'utf-8');
    }, 80);
    setTimeout(() => {
      expect(callCount).toBe(0);
      done();
    }, 300);
  }, 3000);
});
