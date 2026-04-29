import { maskEnv, isSensitiveKey } from './masker';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PASSWORD: 'supersecret',
  API_KEY: 'key-abc',
  APP_SECRET: 'mysecret',
  LOG_LEVEL: 'debug',
  AUTH_TOKEN: 'tok-xyz',
};

describe('maskEnv', () => {
  it('masks keys matching default sensitive pattern', () => {
    const result = maskEnv(sampleEnv);
    expect(result.DB_PASSWORD).toBe('***');
    expect(result.API_KEY).toBe('***');
    expect(result.APP_SECRET).toBe('***');
    expect(result.AUTH_TOKEN).toBe('***');
    expect(result.DB_HOST).toBe('localhost');
    expect(result.LOG_LEVEL).toBe('debug');
  });

  it('masks explicitly listed keys', () => {
    const result = maskEnv(sampleEnv, { sensitiveKeys: ['DB_HOST'] });
    expect(result.DB_HOST).toBe('***');
  });

  it('uses custom mask character', () => {
    const result = maskEnv(sampleEnv, { maskChar: '[REDACTED]' });
    expect(result.DB_PASSWORD).toBe('[REDACTED]');
  });

  it('does not mutate the original env', () => {
    maskEnv(sampleEnv);
    expect(sampleEnv.DB_PASSWORD).toBe('supersecret');
  });

  it('handles undefined values gracefully', () => {
    const env = { SOME_KEY: undefined };
    const result = maskEnv(env);
    expect(result.SOME_KEY).toBeUndefined();
  });
});

describe('isSensitiveKey', () => {
  it('returns true for keys matching default pattern', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('API_TOKEN')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(isSensitiveKey('LOG_LEVEL')).toBe(false);
    expect(isSensitiveKey('APP_PORT')).toBe(false);
  });

  it('returns true for explicitly listed keys', () => {
    expect(isSensitiveKey('MY_CUSTOM', { sensitiveKeys: ['MY_CUSTOM'] })).toBe(true);
  });
});
