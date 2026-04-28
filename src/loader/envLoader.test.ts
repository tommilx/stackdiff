import fs from 'fs';
import path from 'path';
import { loadEnvFile, loadEnvPair } from './envLoader';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('loadEnvFile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('parses a valid env file and returns structured data', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('KEY=value\nNAME=stackdiff\n');

    const result = loadEnvFile('./staging.env', 'staging');

    expect(result.label).toBe('staging');
    expect(result.data).toEqual({ KEY: 'value', NAME: 'stackdiff' });
  });

  it('throws when file is missing and required is true', () => {
    mockFs.existsSync.mockReturnValue(false);

    expect(() => loadEnvFile('./missing.env', 'staging')).toThrow(
      'Env file not found'
    );
  });

  it('returns empty data when file is missing and required is false', () => {
    mockFs.existsSync.mockReturnValue(false);

    const result = loadEnvFile('./missing.env', 'staging', { required: false });

    expect(result.data).toEqual({});
  });
});

describe('loadEnvPair', () => {
  it('returns a tuple of two loaded envs', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync
      .mockReturnValueOnce('A=1\n')
      .mockReturnValueOnce('A=2\n');

    const [envA, envB] = loadEnvPair('./a.env', './b.env');

    expect(envA.label).toBe('staging');
    expect(envB.label).toBe('production');
    expect(envA.data).toEqual({ A: '1' });
    expect(envB.data).toEqual({ A: '2' });
  });
});
