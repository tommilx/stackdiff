import {
  filterByKeys,
  filterByPattern,
  excludeByKeys,
  excludeByPattern,
  applyFilters,
} from './envFilter';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_PORT: '3000',
  APP_SECRET: 'abc123',
  LOG_LEVEL: 'info',
};

describe('filterByKeys', () => {
  it('returns only specified keys', () => {
    const result = filterByKeys(sampleEnv, ['DB_HOST', 'LOG_LEVEL']);
    expect(result).toEqual({ DB_HOST: 'localhost', LOG_LEVEL: 'info' });
  });

  it('returns empty object when no keys match', () => {
    expect(filterByKeys(sampleEnv, ['MISSING'])).toEqual({});
  });
});

describe('filterByPattern', () => {
  it('filters keys matching a regex string', () => {
    const result = filterByPattern(sampleEnv, '^DB_');
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('accepts a RegExp object', () => {
    const result = filterByPattern(sampleEnv, /^APP_/);
    expect(Object.keys(result)).toEqual(['APP_PORT', 'APP_SECRET']);
  });
});

describe('excludeByKeys', () => {
  it('removes specified keys', () => {
    const result = excludeByKeys(sampleEnv, ['LOG_LEVEL']);
    expect(result).not.toHaveProperty('LOG_LEVEL');
    expect(Object.keys(result)).toHaveLength(4);
  });
});

describe('excludeByPattern', () => {
  it('removes keys matching the pattern', () => {
    const result = excludeByPattern(sampleEnv, /^DB_/);
    expect(Object.keys(result)).toEqual(['APP_PORT', 'APP_SECRET', 'LOG_LEVEL']);
  });
});

describe('applyFilters', () => {
  it('applies include keys and exclude pattern together', () => {
    const result = applyFilters(sampleEnv, {
      keys: ['DB_HOST', 'DB_PORT', 'APP_SECRET'],
      excludePattern: '^DB_',
    });
    expect(result).toEqual({ APP_SECRET: 'abc123' });
  });

  it('returns full env when no options given', () => {
    expect(applyFilters(sampleEnv, {})).toEqual(sampleEnv);
  });
});
