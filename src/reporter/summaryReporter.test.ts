import { computeSummary, formatSummary } from './summaryReporter';
import { DiffResult } from '../parser/index';

const sampleDiff: DiffResult = {
  API_URL: { status: 'changed', sourceValue: 'http://staging.api', targetValue: 'http://prod.api' },
  DEBUG: { status: 'removed', sourceValue: 'true', targetValue: undefined },
  NEW_FEATURE: { status: 'added', sourceValue: undefined, targetValue: 'enabled' },
  DB_HOST: { status: 'unchanged', sourceValue: 'localhost', targetValue: 'localhost' },
  DB_PORT: { status: 'unchanged', sourceValue: '5432', targetValue: '5432' },
};

describe('computeSummary', () => {
  it('counts keys by status correctly', () => {
    const report = computeSummary(sampleDiff);
    expect(report.stats.total).toBe(5);
    expect(report.stats.added).toBe(1);
    expect(report.stats.removed).toBe(1);
    expect(report.stats.changed).toBe(1);
    expect(report.stats.unchanged).toBe(2);
  });

  it('populates key lists correctly', () => {
    const report = computeSummary(sampleDiff);
    expect(report.addedKeys).toEqual(['NEW_FEATURE']);
    expect(report.removedKeys).toEqual(['DEBUG']);
    expect(report.changedKeys).toEqual(['API_URL']);
  });

  it('sets hasChanges to true when differences exist', () => {
    const report = computeSummary(sampleDiff);
    expect(report.hasChanges).toBe(true);
  });

  it('sets hasChanges to false when all keys are unchanged', () => {
    const noDiff: DiffResult = {
      KEY_A: { status: 'unchanged', sourceValue: 'val', targetValue: 'val' },
    };
    const report = computeSummary(noDiff);
    expect(report.hasChanges).toBe(false);
  });

  it('handles empty diff', () => {
    const report = computeSummary({});
    expect(report.stats.total).toBe(0);
    expect(report.hasChanges).toBe(false);
  });
});

describe('formatSummary', () => {
  it('includes all stat lines', () => {
    const report = computeSummary(sampleDiff);
    const output = formatSummary(report);
    expect(output).toContain('5 key(s) total');
    expect(output).toContain('+ 1 added');
    expect(output).toContain('- 1 removed');
    expect(output).toContain('~ 1 changed');
    expect(output).toContain('= 2 unchanged');
  });

  it('shows no-differences message when no changes', () => {
    const noDiff: DiffResult = {
      KEY_A: { status: 'unchanged', sourceValue: 'val', targetValue: 'val' },
    };
    const report = computeSummary(noDiff);
    const output = formatSummary(report);
    expect(output).toContain('No differences found.');
  });
});
