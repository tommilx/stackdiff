#!/usr/bin/env node

/**
 * stackdiff CLI entry point
 * Parses arguments and orchestrates the diff workflow
 */

import { Command } from 'commander';
import * as path from 'path';
import { loadEnvPair } from './loader';
import { diffEnvs } from './parser';
import { formatDiff } from './formatter/diffFormatter';

const program = new Command();

program
  .name('stackdiff')
  .description('Visually diff environment configs and .env files across staging and production')
  .version('0.1.0');

program
  .command('diff <file1> <file2>')
  .description('Diff two .env files and display the result')
  .option('-f, --format <format>', 'Output format: text | json | table', 'text')
  .option('-o, --output <file>', 'Write output to a file instead of stdout')
  .option('--no-color', 'Disable colored output')
  .option('--only-changed', 'Show only keys that differ between the two files')
  .action(async (file1: string, file2: string, options: {
    format: 'text' | 'json' | 'table';
    output?: string;
    color: boolean;
    onlyChanged: boolean;
  }) => {
    try {
      const absFile1 = path.resolve(process.cwd(), file1);
      const absFile2 = path.resolve(process.cwd(), file2);

      // Load both env files
      const { left, right } = await loadEnvPair(absFile1, absFile2);

      // Compute the diff
      const diffResult = diffEnvs(left, right);

      // Apply --only-changed filter if requested
      const filtered = options.onlyChanged
        ? diffResult.filter((entry) => entry.status !== 'unchanged')
        : diffResult;

      // Format the output
      const output = formatDiff(filtered, {
        format: options.format,
        color: options.color,
        labels: {
          left: file1,
          right: file2,
        },
      });

      // Write to file or stdout
      if (options.output) {
        const fs = await import('fs/promises');
        const absOutput = path.resolve(process.cwd(), options.output);
        await fs.writeFile(absOutput, output, 'utf-8');
        console.log(`Output written to ${absOutput}`);
      } else {
        console.log(output);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  });

program
  .command('validate <file>')
  .description('Validate that a .env file is well-formed')
  .action(async (file: string) => {
    try {
      const absFile = path.resolve(process.cwd(), file);
      const { loadEnvFile } = await import('./loader');
      const env = await loadEnvFile(absFile);
      const keyCount = Object.keys(env).length;
      console.log(`✔  ${file} is valid — ${keyCount} key${keyCount !== 1 ? 's' : ''} found.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✖  Validation failed: ${message}`);
      process.exit(1);
    }
  });

// Show help when no subcommand is provided
if (process.argv.length < 3) {
  program.help();
}

program.parse(process.argv);
