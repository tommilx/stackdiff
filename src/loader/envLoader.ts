import fs from 'fs';
import path from 'path';
import { parseEnvFile } from '../parser';

export interface LoadOptions {
  required?: boolean;
  encoding?: BufferEncoding;
}

export interface LoadedEnv {
  filePath: string;
  label: string;
  data: Record<string, string>;
}

export function loadEnvFile(
  filePath: string,
  label: string,
  options: LoadOptions = {}
): LoadedEnv {
  const { required = true, encoding = 'utf-8' } = options;
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    if (required) {
      throw new Error(`Env file not found: ${resolved}`);
    }
    return { filePath: resolved, label, data: {} };
  }

  const content = fs.readFileSync(resolved, { encoding });
  const data = parseEnvFile(content);

  return { filePath: resolved, label, data };
}

export function loadEnvPair(
  fileA: string,
  fileB: string,
  labelA = 'staging',
  labelB = 'production',
  options: LoadOptions = {}
): [LoadedEnv, LoadedEnv] {
  const envA = loadEnvFile(fileA, labelA, options);
  const envB = loadEnvFile(fileB, labelB, options);
  return [envA, envB];
}
