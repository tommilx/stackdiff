import { parseEnvString } from './envParser';

describe('parseEnvString', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnvString('FOO=bar\nBAZ=qux');
    expect(result.entries.size).toBe(2);
    expect(result.entries.get('FOO')?.value).toBe('bar');
    expect(result.entries.get('BAZ')?.value).toBe('qux');
  });

  it('ignores comments and blank lines', () => {
    const content = `# comment\n\nKEY=value\n  # another comment`;
    const result = parseEnvString(content);
    expect(result.entries.size).toBe(1);
    expect(result.entries.get('KEY')?.value).toBe('value');
  });

  it('strips surrounding quotes from values', () => {
    const result = parseEnvString('SECRET="my secret"\nTOKEN=\'abc123\'');
    expect(result.entries.get('SECRET')?.value).toBe('my secret');
    expect(result.entries.get('TOKEN')?.value).toBe('abc123');
  });

  it('records correct line numbers', () => {
    const result = parseEnvString('FIRST=1\n\nTHIRD=3');
    expect(result.entries.get('FIRST')?.lineNumber).toBe(1);
    expect(result.entries.get('THIRD')?.lineNumber).toBe(3);
  });

  it('reports errors for lines missing =', () => {
    const result = parseEnvString('BADLINE');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('missing');
  });

  it('handles values containing = signs', () => {
    const result = parseEnvString('CONN=host=localhost;port=5432');
    expect(result.entries.get('CONN')?.value).toBe('host=localhost;port=5432');
  });
});
