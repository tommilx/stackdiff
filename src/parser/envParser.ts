import * as fs from 'fs';
import * as path from 'path';

export interface EnvEntry {
  key: string;
  value: string;
  lineNumber: number;
}

export interface ParsedEnv {
  filePath: string;
  entries: Map<string, EnvEntry>;
  errors: string[];
}

export function parseEnvFile(filePath: string): ParsedEnv {
  const resolved = path.resolve(filePath);
  const result: ParsedEnv = {
    filePath: resolved,
    entries: new Map(),
    errors: [],
  };

  if (!fs.existsSync(resolved)) {
    result.errors.push(`File not found: ${resolved}`);
    return result;
  }

  const content = fs.readFileSync(resolved, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      result.errors.push(`Line ${lineNumber}: invalid format (missing '=')`);
      return;
    }

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, '');

    if (!key) {
      result.errors.push(`Line ${lineNumber}: empty key`);
      return;
    }

    result.entries.set(key, { key, value, lineNumber });
  });

  return result;
}

export function parseEnvString(content: string, label = 'inline'): ParsedEnv {
  const tmpFile = `/tmp/stackdiff_${Date.now()}.env`;
  fs.writeFileSync(tmpFile, content, 'utf-8');
  const result = parseEnvFile(tmpFile);
  result.filePath = label;
  fs.unlinkSync(tmpFile);
  return result;
}
