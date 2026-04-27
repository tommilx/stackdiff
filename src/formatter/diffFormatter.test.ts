import { formatDiff, formatText, formatJson, formatTable } from './diffFormatter';
import { DiffResult } from '../parser/envDiff';

const mockDiff: DiffResult = {
  entries: [
    { key: 'API_URL', status: 'changed', leftValue: 'http://staging.api', rightValue: 'http://prod.api' },
    { key: 'NEW_FEATURE', status: 'added', leftValue: undefined, rightValue: 'true' },
    { key: 'OLD_KEY', status: 'removed', leftValue: 'deprecated', rightValue: undefined },
    { key: 'PORT', status: 'unchanged', leftValue: '3000', rightValue: '3000' },
  ],
  stats: { added: 1, removed: 1, changed: 1, unchanged: 1 },
};

describe('diffFormatter', () => {
  describe('formatText', () => {
    it('should include all keys in output', () => {
      const output = formatText(mockDiff, false);
      expect(output).toContain('API_URL');
      expect(output).toContain('NEW_FEATURE');
      expect(output).toContain('OLD_KEY');
      expect(output).toContain('PORT');
    });

    it('should use correct symbols for each status', () => {
      const output = formatText(mockDiff, false);
      expect(output).toContain('+ NEW_FEATURE=true');
      expect(output).toContain('- OLD_KEY=deprecated');
      expect(output).toContain('~ API_URL: http://staging.api → http://prod.api');
      expect(output).toContain('  PORT=3000');
    });

    it('should include summary line', () => {
      const output = formatText(mockDiff, false);
      expect(output).toContain('Summary: +1 added, -1 removed, ~1 changed, 1 unchanged');
    });
  });

  describe('formatJson', () => {
    it('should return valid JSON', () => {
      const output = formatJson(mockDiff);
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should contain all diff data', () => {
      const parsed = JSON.parse(formatJson(mockDiff));
      expect(parsed.stats).toEqual(mockDiff.stats);
      expect(parsed.entries).toHaveLength(4);
    });
  });

  describe('formatTable', () => {
    it('should include header row', () => {
      const output = formatTable(mockDiff);
      expect(output).toContain('KEY');
      expect(output).toContain('STATUS');
      expect(output).toContain('LEFT');
      expect(output).toContain('RIGHT');
    });

    it('should include all entry keys', () => {
      const output = formatTable(mockDiff);
      expect(output).toContain('API_URL');
      expect(output).toContain('NEW_FEATURE');
    });
  });

  describe('formatDiff', () => {
    it('should delegate to formatJson when format is json', () => {
      const output = formatDiff(mockDiff, 'json');
      expect(() => JSON.parse(output)).not.toThrow();
    });

    it('should delegate to formatTable when format is table', () => {
      const output = formatDiff(mockDiff, 'table');
      expect(output).toContain('KEY');
    });

    it('should default to text format', () => {
      const output = formatDiff(mockDiff, 'text', false);
      expect(output).toContain('Summary:');
    });
  });
});
