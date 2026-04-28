/**
 * Parser module for stackdiff.
 * Provides utilities for parsing and diffing environment files.
 *
 * @module parser
 *
 * @example
 * ```ts
 * import { parseEnvFile, diffEnvs } from './parser';
 *
 * const base = parseEnvFile('.env');
 * const head = parseEnvFile('.env.production');
 * const result = diffEnvs(base, head);
 * ```
 */

export { parseEnvFile, parseEnvString } from './envParser';
export type { EnvEntry, ParsedEnv } from './envParser';
export { diffEnvs } from './envDiff';
export type { DiffEntry, DiffStatus, EnvDiffResult } from './envDiff';
