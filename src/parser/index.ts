/**
 * Parser module for stackdiff.
 * Provides utilities for parsing and diffing environment files.
 */

export { parseEnvFile, parseEnvString } from './envParser';
export type { EnvEntry, ParsedEnv } from './envParser';
export { diffEnvs } from './envDiff';
export type { DiffEntry, DiffStatus, EnvDiffResult } from './envDiff';
